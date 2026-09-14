import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';

import { ConnectionList } from '@/components/ConnectionList';
import { ReferAction, type ReferCardState } from '@/components/ReferAction';
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
// The card collapse animation duration, so state settles after it finishes.
const COLLAPSE_MS = 260;

type RecipientStatus = 'pending' | 'accepted' | 'declined';

/** Which reply a user gave in a referral: recipient ids are stored sorted. */
function statusOf(r: ApiReferralRequest, userId: number): RecipientStatus {
  return (r.first_user_id === userId ? r.first_status : r.second_status) as RecipientStatus;
}

/** Whether a referral involves exactly the given pair, in either order. */
function involvesPair(r: ApiReferralRequest, a: number, b: number): boolean {
  return (
    (r.first_user_id === a && r.second_user_id === b) ||
    (r.first_user_id === b && r.second_user_id === a)
  );
}

export default function ReferFriendScreen() {
  // The person whose card was expanded on Connections: the first recipient.
  // Every other connection can be introduced to them.
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>();
  const referredId = Number(id);
  const { user } = useAuth();
  const { connections, loading } = useConnections();
  const { referrals, send, reload } = useOutgoingReferrals();

  // Lifted from the list so the resolved flows can close a card.
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Shows the Send Request pill while a resolved card compresses in place.
  const [collapsingId, setCollapsingId] = useState<string | null>(null);
  // Drives the height shrink itself, so the pill can hold at full size first.
  const [shrinkingId, setShrinkingId] = useState<string | null>(null);

  // The referred user's own connections: introducing someone they already know
  // is pointless, so they are filtered out below. Fetched fresh on every focus.
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

  // Live responses: a recipient's accept/decline arrives over the shared
  // socket, so an open card updates in place. The same rows are re-fetched on
  // focus too, so the outcome persists across navigation.
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
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
    (cardId: number): ApiReferralRequest | null => {
      const resolved = referrals.filter(
        (r) =>
          involvesPair(r, referredId, cardId) &&
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

  // A card's full referral state, derived from its most recent request for the
  // pair: pending locks it with an awaiting note, an un-consumed resolved one
  // shows its outcome, and everything else is idle.
  const cardState = useCallback(
    (cardId: number): ReferCardState => {
      const rows = referrals.filter((r) => involvesPair(r, referredId, cardId));
      const pendingRow = rows.find((r) => r.status === 'pending' && !isConsumed(r));
      if (pendingRow) {
        return {
          overall: 'pending',
          aStatus: statusOf(pendingRow, referredId),
          bStatus: statusOf(pendingRow, cardId),
        };
      }
      const latest = resolvedFor(cardId);
      if (latest) {
        return {
          overall: latest.status as 'accepted' | 'declined',
          aStatus: statusOf(latest, referredId),
          bStatus: statusOf(latest, cardId),
        };
      }
      return { overall: 'idle', aStatus: null, bStatus: null };
    },
    [referrals, referredId, resolvedFor, isConsumed],
  );

  // Compress the card, content switching back to the Send Request pill while
  // it shrinks. The outcome has already been seen by the time this runs, so
  // the pill and the shrink start together instead of holding on screen.
  const collapseCard = useCallback(
    (cardId: string) => {
      setCollapsingId(cardId);
      setShrinkingId(cardId);
      setTimeout(() => {
        setExpandedId((cur) => (cur === cardId ? null : cur));
        setCollapsingId((cur) => (cur === cardId ? null : cur));
        setShrinkingId((cur) => (cur === cardId ? null : cur));
      }, COLLAPSE_MS);
    },
    [],
  );

  // After the 1s outcome flash the card consumes the referral and compresses
  // in place, staying on this screen so a new request can be sent.
  const handleAutoCollapse = useCallback(
    (cardId: string) => {
      const resolved = resolvedFor(Number(cardId));
      if (resolved) {
        markReferralConsumedLocally(resolved.id);
        consumeReferral(resolved.id).catch((error) => console.error('[refer] consume failed', error));
      }
      collapseCard(cardId);
    },
    [resolvedFor, collapseCard],
  );

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
          expandedContent={(c) => (
            <ReferAction
              name={name ?? ''}
              otherName={c.name}
              state={cardState(Number(c.id))}
              collapsing={collapsingId === c.id}
              onSend={() => send(referredId, Number(c.id))}
              onAutoCollapse={() => handleAutoCollapse(c.id)}
            />
          )}
        />
      </View>
    </Screen>
  );
}