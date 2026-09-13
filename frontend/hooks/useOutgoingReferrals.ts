import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { createReferral, getOutgoingReferrals, type ApiReferralRequest } from '@/lib/api';

/** The refer screen's pending requests: everything the current user sent,
 * fetched on focus so re-navigation re-locks already-requested targets. */
export function useOutgoingReferrals() {
  const [referrals, setReferrals] = useState<ApiReferralRequest[]>([]);

  const reload = useCallback(async () => {
    try {
      setReferrals(await getOutgoingReferrals());
    } catch {
      setReferrals([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const send = useCallback(
    async (referredId: number, targetId: number) => {
      console.log('[refer] send request button tapped', { referredId, targetId });
      console.log('[refer] POST /referrals', { referred_id: referredId, target_id: targetId });
      try {
        const created = await createReferral(referredId, targetId);
        console.log('[refer] POST /referrals response', {
          id: created.id,
          status: created.status,
          referred_id: created.referred_id,
          target_id: created.target_id,
        });
        // The swap from button to "Awaiting Response" happens here, only after the
        // backend row exists, and never inside or after any push call.
        const next = [
          ...referrals.filter((r) => !(r.referred_id === referredId && r.target_id === targetId)),
          created,
        ];
        console.log('[refer] referral created; updating card state', {
          referralId: created.id,
          referredId,
          targetId,
          status: created.status,
          pendingBefore: referrals.some((r) => r.status === 'pending'),
        });
        setReferrals(next);
        console.log('[refer] card state update queued', {
          pendingAfter: next.some((r) => r.status === 'pending'),
        });
      } catch (error) {
        console.error('[refer] POST /referrals failed', error);
      }
    },
    [referrals],
  );

  return { referrals, reload, send };
}