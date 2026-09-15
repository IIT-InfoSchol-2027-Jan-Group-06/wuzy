import React from 'react';
import { useRouter } from 'expo-router';
import { ConnectCard } from '@/components/ConnectCard';
import { accountFor } from '@/constants/accounts';
import { useAuth } from '@/context/auth';

export default function ConnectScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const extra = accountFor(user?.username);

  if (!user) return null;
  const name = user.display_name ?? user.username;
  const qrValue = `https://wuzy.app/profile/${user.username}`;

  return (
    <ConnectCard
      username={name.split(' ')[0]}
      qrValue={qrValue}
      onBack={() => router.back()}
      onConnected={() => router.back()}
      backgroundImage={extra.backgroundImage}
    />
  );
}