import { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ConnectCard } from '@/components/ConnectCard';
import { apiGet, assetUrl, consumeReferral, type ApiUser } from '@/lib/api';
import { markReferralConsumedLocally } from '@/lib/referral-flow';

/** The approving (referred) user's full-screen QR, shown to the sender after
 * an accepted referral. No camera, no toggle, no back button: just their card
 * and a Done pill that resolves the referral one last time. */
export default function ReferralQrScreen() {
  const router = useRouter();
  const { requestId, referredId } = useLocalSearchParams<{ requestId?: string; referredId?: string }>();
  const [userA, setUserA] = useState<ApiUser | null>(null);

  // The QR and the name both come from the approving user's own record, never
  // the sender's, because the code being scanned points at User A's profile.
  useEffect(() => {
    if (!referredId) return;
    let stale = false;
    apiGet<ApiUser>(`/users/${referredId}`)
      .then((u) => {
        if (!stale) setUserA(u);
      })
      .catch(() => {});
    return () => {
      stale = true;
    };
  }, [referredId]);

  const handleDone = useCallback(async () => {
    if (requestId) {
      const id = Number(requestId);
      markReferralConsumedLocally(id);
      try {
        await consumeReferral(id);
      } catch (error) {
        console.error('[referral-qr] consume failed', error);
      }
    }
    // Pop back to the refer screen; its card has already switched to "Send
    // Request" and collapses itself before both screens land back at Connections.
    router.back();
  }, [requestId, router]);

  if (!userA) return null;

  return (
    <ConnectCard
      username={userA.display_name ?? userA.username}
      qrValue={`https://wuzy.app/profile/${userA.username}`}
      onBack={() => router.back()}
      backgroundImage={userA.avatar_url ? { uri: assetUrl(userA.avatar_url) } : undefined}
      showBack={false}
      doneLabel="Done"
      onDone={handleDone}
    />
  );
}