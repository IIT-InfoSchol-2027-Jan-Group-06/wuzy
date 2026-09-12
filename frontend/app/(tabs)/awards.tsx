import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { TabHeader } from '@/components/TabHeader';
import { QuestsSection } from '@/components/awards/QuestsSection';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { apiCompleteProfile, apiGetAwards, apiGetQuests, apiPurchaseTicket, apiRecordDailyLogin, type ApiAwardRead, type ApiQuest } from '@/lib/api';

const stickerBoardImage = require('@/assets/badges/image.png');

export default function AwardsScreen() {
  const [quests, setQuests] = useState<ApiQuest[]>([]);
  const [awards, setAwards] = useState<ApiAwardRead[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const loadQuests = useCallback(() => {
    apiRecordDailyLogin()
      .then(() => apiGetQuests())
      .then((data) => setQuests(data.quests))
      .catch(() => setQuests([]));
  }, []);

  const loadAwards = useCallback(() => {
    apiGetAwards()
      .then((data) => setAwards(data))
      .catch(() => setAwards([]));
  }, []);

  const markTaskComplete = useCallback((name: string) => {
    setCompletedTasks((prev) => new Set(prev).add(name));
  }, []);

  const handlePurchaseTicket = async () => {
    setProcessing('ticket');
    try {
      await apiPurchaseTicket();
      Alert.alert('Award', 'Ticket purchased! +50 XP earned');
      markTaskComplete('Purchase Ticket');
      loadQuests();
      loadAwards();
    } catch {
      Alert.alert('Error', 'Failed to purchase ticket');
    } finally {
      setProcessing(null);
    }
  };

  const handleCompleteProfile = async () => {
    setProcessing('profile');
    try {
      await apiCompleteProfile();
      Alert.alert('Award', 'Profile complete! +100 XP earned');
      markTaskComplete('Complete Profile');
      loadAwards();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('already claimed')) {
        Alert.alert('Award', 'Profile completion award already claimed');
      } else {
        Alert.alert('Error', 'Failed to complete profile');
      }
    } finally {
      setProcessing(null);
    }
  };

  const onClaimTask = useCallback((name: string) => {
    return async () => {
      if (name === 'Purchase Ticket') {
        await handlePurchaseTicket();
      } else if (name === 'Complete Profile') {
        await handleCompleteProfile();
      }
    };
  }, [handlePurchaseTicket, handleCompleteProfile]);

  useFocusEffect(
    useCallback(() => {
      loadQuests();
      loadAwards();
    }, [loadQuests, loadAwards]),
  );

  return (
    <Screen scroll style={{ gap: wuzyLayout.gap, paddingBottom: 96 }}>
      <TabHeader title="Awards" />
      <View>
        <Text style={{ fontFamily: wuzyFonts.bold, fontSize: wuzyType.body, color: wuzyColors.yellow }}>
          Tasks and Sticker Board
        </Text>
        <View style={{ marginTop: 6, alignItems: 'center' }}>
          <Text
            className="text-center"
            style={{
              fontFamily: wuzyFonts.semibold,
              fontSize: 13,
              color: wuzyColors.yellowMuted,
              paddingVertical: 6,
            }}>
            Complete a task to earn its badge
          </Text>
          <Image
            source={stickerBoardImage}
            style={{ width: 260, height: 260, resizeMode: 'contain' }}
          />
        </View>

        <QuestsSection quests={quests} onClaimed={loadQuests} completedTasks={completedTasks} onClaimTask={onClaimTask} />
      </View>
    </Screen>
  );
}