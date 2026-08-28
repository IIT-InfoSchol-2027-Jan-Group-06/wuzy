import React from 'react';
import { useRouter } from 'expo-router';
import { mockUserProfile } from '@/constants/profile-data';
import { ConnectCard } from '@/components/ConnectCard';

export default function ConnectScreen() {
  const router = useRouter();
  const u = mockUserProfile;

  const qrValue = `https://wuzy.app/profile/${u.username.replace('@', '')}`;

  return (
    <ConnectCard
      username={u.name.split(' ')[0]}
      qrValue={qrValue}
      onBack={() => router.back()}
      backgroundImage={u.backgroundImage}
    />
  );
}