import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { ConnectionList } from '@/components/ConnectionList';
import { ReferAction } from '@/components/ReferAction';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { wuzyLayout } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';
import { useConnections } from '@/hooks/useConnections';
import { useOutgoingReferrals } from '@/hooks/useOutgoingReferrals';
import { consumeReferral, getUserConnections, type ApiReferralRequest } from '@/lib/api';
import { isReferralConsumedLocally, markReferralConsumedLocally } from '@/lib/referral-flow';
import { acquireChat, subscribeReferralResponses } from '@/lib/ws';

const COMPRESSED_HEIGHT = 132;
// How long a resolved card holds on the Send Request pill before it starts shrinking.
const PILL_HOLD_MS = 2000;
// The card collapse animation duration, so navigation happens after it settles.
const COLLAPSE_MS = 260;

type ReferState = 'idle' | 'pending' | 'approved' | 'declined';

export default function ReferFriendScreen() {
  const router = useRouter();
  // The person being referred: excluded from the list and named in the sent-request note.
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>();
  const referredId = Number(id);
  const { user } = useAuth();
  const { connections, loading } = useConnections();
  const { referrals, send, reload } = useOutgoingReferrals();

  // Lifted from the list so the resolved flows (done / denied) can close a card.
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Shows the Send Request pill while a resolved card waits to compress.
  const [collapsingId, setCollapsingId] = useState<string | null>(null);
  // Drives the height shrink itself, so the pill can hold at full size first.
  const [shrinkingId, setShrinkingId] = useState<string | null>(null);
  // Re-evaluates the collapse logic below every time the screen regains focus,
  // so a card resolved elsewhere (Done on the QR screen) is closed even if the
  // refetch on focus fails.
  const [focusTick, setFocusTick] = useState(0);

  // The referred user's own connections: referring someone who already knows
  // the target is pointless, so they are filtered out below. Fetched fresh on
  // every focus, never a stale cached list.
  const [referredConnections, setReferredConnections] = useState<Set<string>>(new Set());
  const [referredLoading, setReferredLoading] = useState(true);

  // Everyone the current user can refer: their connections, minus the referred
  // user themselves and anyone the referred user is already connected to.
  const referable = useMemo(
    () => connections.filter((c) => c.id !== id && !referredConnections.has(c.id)),
    [connections, id, referredConnections],
  );

  // A resolved referral stops driving its card once the sender has finished
  // seeing it, whether the server knows (consumed) or this session does.
  const isConsumed = useCallback(
    (r: ApiReferralRequest) => r.consumed || isReferralConsumedLocally(r.id),
    [],
  );

  // Live responses: the referred user's accept/decline arrives over the shared
  // socket, so an open card updates in place. The same rows are re-fetched on
  // focus too, so the outcome persists across navigation.
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setFocusTick((t) => t + 1);
      const release = acquireChat(user.id);
      const unsubscribe = subscribeReferralResponses(() => {
        reload();
      });
      return () => {
        unsubscribe();
        release();
      };
    }, [user, reload]),
  );

  // The referred user's connections refetch whenever the screen regains focus,
  // so the exclusion above always reflects the latest mutual follows.
  useFocusEffect(
    useCallback(() => {
      if (!Number.isFinite(referredId)) return;
      setReferredLoading(true);
      let active = true;
      getUserConnections(referredId)
        .then((people) => {
          if (active) setReferredConnections(new Set(people.map((p) => String(p.id))));
        })
        .catch(() => {
          if (active) setReferredConnections(new Set());
        })
        .finally(() => {
          if (active) setReferredLoading(false);
        });
      return () => {
        active = false;
      };
    }, [referredId]),
  );

  // The latest resolved (accepted or declined), un-consumed referral for a
  // card; the one that currently shows its outcome.
  const resolvedFor = useCallback(
    (targetId: number): ApiReferralRequest | null => {
      const resolved = referrals.filter(
        (r) =>
          r.referred_id === referredId &&
          r.target_id === targetId &&
          (r.status === 'accepted' || r.status === 'declined') &&
          !isConsumed(r),
      );
      return resolved.reduce<ApiReferralRequest | null>(
        (best, r) => (best === null || r.id > best.id ? r : best),
        null,
      );
    },
    [referrals, referredId, isConsumed],
  );

  // The most recent referral for this card decides its state: pending locks it,
  // an un-consumed resolved one shows its outcome, and everything else is idle.
  const stateFor = useCallback(
    (targetId: number): ReferState => {
      const rows = referrals.filter((r) => r.referred_id === referredId && r.target_id === targetId);
      if (rows.some((r) => r.status === 'pending' && !isConsumed(r))) return 'pending';
      const latest = resolvedFor(targetId);
      if (latest) return latest.status === 'accepted' ? 'approved' : 'declined';
      return 'idle';
    },
    [referrals, referredId, isConsumed, resolvedFor],
  );

  // Compress the card (content switches back to the Send Request pill while it
  // shrinks), then optionally leave the screen the same way the header back
  // button does. The pill replaces the outcome text first, holds for 2 seconds,
  // and only then does the card begin to collapse.
  const collapseCard = useCallback(
    (targetId: string, navigateBack: boolean) => {
      setCollapsingId(targetId);
      setTimeout(() => {
        setShrinkingId(targetId);
        setTimeout(() => {
          setExpandedId((cur) => (cur === targetId ? null : cur));
          setCollapsingId((cur) => (cur === targetId ? null : cur));
          setShrinkingId((cur) => (cur === targetId ? null : cur));
          if (navigateBack) router.back();
        }, COLLAPSE_MS);
      }, PILL_HOLD_MS);
    },
    [router],
  );

  // Denied flow: after the 3s flash the card consumes the referral, then
  // compresses and returns to Connections, all in one visit.
  const handleAutoCollapse = useCallback(
    (targetId: string) => {
      const resolved = resolvedFor(Number(targetId));
      if (resolved) {
        markReferralConsumedLocally(resolved.id);
        consumeReferral(resolved.id).catch((error) => console.error('[refer] consume failed', error));
      }
      collapseCard(targetId, true);
    },
    [resolvedFor, collapseCard],
  );

  // Approved flow: the QR button opens the approving user's referral QR screen.
  const openQr = useCallback(
    (resolved: ApiReferralRequest) => {
      router.push({
        pathname: '/referral-qr',
        params: { requestId: String(resolved.id), referredId: String(resolved.referred_id) },
      });
    },
    [router],
  );

  // When Done on the QR screen consumes the referral, the expanded card drops
  // straight back to the Send Request pill; compress it and leave, the same
  // way the declined flash does. `prevExpanded` remembers which card the prior
  // state belonged to so switching cards cannot trigger a false collapse.
  const prevExpanded = useRef<{ id: string | null; state: ReferState | null }>({ id: null, state: null });
  useEffect(() => {
    if (expandedId === null) {
      prevExpanded.current = { id: null, state: null };
      return;
    }
    const current = stateFor(Number(expandedId));
    const previous = prevExpanded.current.id === expandedId ? prevExpanded.current.state : null;
    prevExpanded.current = { id: expandedId, state: current };
    if (collapsingId === expandedId) return;
    if ((previous === 'approved' || previous === 'declined') && current === 'idle') {
      collapseCard(expandedId, true);
    }
  }, [expandedId, stateFor, collapsingId, collapseCard, focusTick]);

  return (
    <Screen>
      <View style={{ flex: 1, gap: wuzyLayout.itemGap }}>
        <ScreenHeader title="Refer to :" />
        <ConnectionList
          connections={referable}
          loading={loading || referredLoading}
          emptyLabel="No connections to refer to"
          showCount={false}
          expandedId={expandedId}
          onExpandedChange={setExpandedId}
          heightFor={(c) => (shrinkingId === c.id ? COMPRESSED_HEIGHT : undefined)}
          expandedContent={(c) => {
            const state = stateFor(Number(c.id));
            const resolved = resolvedFor(Number(c.id));
            return (
              <ReferAction
                name={name ?? ''}
                pending={state === 'pending'}
                outcome={state === 'approved' || state === 'declined' ? state : null}
                collapsing={collapsingId === c.id}
                onSend={() => send(referredId, Number(c.id))}
                onQr={resolved ? () => openQr(resolved) : undefined}
                onAutoCollapse={() => handleAutoCollapse(c.id)}
              />
            );
          }}
        />
      </View>
    </Screen>
  );
}