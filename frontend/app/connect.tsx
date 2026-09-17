import React from 'react';
import { useRouter } from 'expo-router';
import { ConnectCard } from '@/components/ConnectCard';
import { useAuth } from '@/context/auth';
import { assetUrl } from '@/lib/api';

export default function ConnectScreen() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) return null;
  const name = user.display_name ?? user.username;
  const qrValue = `https://wuzy.app/profile/${user.username}`;

  return (
    <ConnectCard
      username={name.split(' ')[0]}
      qrValue={qrValue}
      onBack={() => router.back()}
      onConnected={() => router.back()}
      backgroundImage={user.avatar_url ? { uri: assetUrl(user.avatar_url) } : require('@/assets/images/profile.jpg')}
    />
  );
}