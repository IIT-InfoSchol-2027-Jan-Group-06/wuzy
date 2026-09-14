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
      console.log('[refer] POST /referrals', { first_user_id: referredId, second_user_id: targetId });
      try {
        const created = await createReferral(referredId, targetId);
        console.log('[refer] POST /referrals response', {
          id: created.id,
          status: created.status,
          first_user_id: created.first_user_id,
          second_user_id: created.second_user_id,
        });
        // The swap from button to "Awaiting Response" happens here, only after the
        // backend row exists, and never inside or after any push call.
        // Keep every other referral but drop any older row for this same pair
        // (either order), so only the fresh pending one drives the card.
        const next = [
          ...referrals.filter(
            (r) =>
              !(
                (r.first_user_id === referredId && r.second_user_id === targetId) ||
                (r.first_user_id === targetId && r.second_user_id === referredId)
              ),
          ),
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