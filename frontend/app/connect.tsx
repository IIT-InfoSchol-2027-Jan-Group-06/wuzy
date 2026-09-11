import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ConnectCard } from '@/components/ConnectCard';
import { accountFor } from '@/constants/accounts';
import { useAuth } from '@/context/auth';
import { wuzyColors, wuzyFonts, wuzyType } from '@/constants/wuzy-theme';
import { apiBumpQuestProgress, apiGetQuests } from '@/lib/api';

export default function ConnectScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const extra = accountFor(user?.username);
  const [connectedCount, setConnectedCount] = useState(0);

  if (!user) return null;
  const name = user.display_name ?? user.username;
  const qrValue = `https://wuzy.app/profile/${user.username}`;

  const handleConnected = async () => {
    try {
      const data = await apiGetQuests();
      const quest = data.quests.find((q) => q.name === 'Social Network');
      if (quest) {
        await apiBumpQuestProgress(quest.id);
      }
    } catch {
      // Bump did not go through; counter stays unchanged.
    }
    setConnectedCount((c) => c + 1);
  };

  return (
    <View style={{ flex: 1 }}>
      <ConnectCard
        username={name.split(' ')[0]}
        qrValue={qrValue}
        onBack={() => router.back()}
        backgroundImage={extra.backgroundImage}
      />
      <View style={{ position: 'absolute', bottom: 80, left: 0, right: 0, alignItems: 'center' }}>
        <Pressable
          onPress={handleConnected}
          accessibilityRole="button"
          className="active:opacity-80"
          style={{
            paddingVertical: 10,
            paddingHorizontal: 24,
            borderRadius: 999,
            backgroundColor: wuzyColors.yellow,
          }}>
          <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.bg }}>
            {connectedCount > 0 ? `${connectedCount} connected` : 'Scan complete'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}