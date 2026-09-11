import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { QuestCard } from '@/components/awards/QuestCard';
import { wuzyColors, wuzyFonts, wuzyType } from '@/constants/wuzy-theme';
import { apiClaimLevel, apiGetQuests, type ApiQuest, type ApiQuestLevel } from '@/lib/api';

// Quests that link to a screen where the user can take the counted action.
// Attend Live Events' action claims its pending reward instead of navigating.
const QUEST_ACTIONS: Record<string, { label: string; route?: '/connect' | '/ticket-vault'; asClaim?: boolean }> = {
  'Attend Live Events': { label: 'Claim', asClaim: true },
  'Social Network': { label: 'Connect', route: '/connect' },
  'Ticket Sharing': { label: 'Share', route: '/ticket-vault' },
};

/** Quests header with a "Ready" gold pill counting claimable levels, then the quest chain cards. */
export function QuestsSection() {
  const router = useRouter();
  const [quests, setQuests] = useState<ApiQuest[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      apiGetQuests()
        .then((data) => {
          if (!active) return;
          setQuests(data.quests);
        })
        .catch(() => {
          if (!active) return;
          setQuests([]);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  const readyCount = useMemo(
    () => quests.reduce((sum, quest) => sum + quest.levels.filter((level) => level.status === 'COMPLETED').length, 0),
    [quests],
  );

  const handleClaim = useCallback(async (level: ApiQuestLevel) => {
    await apiClaimLevel(level.id);
    const data = await apiGetQuests();
    setQuests(data.quests);
  }, []);

  // Header "Claim" (Attend Live Events): claims the quest's pending reward
  // once its step is complete, mirroring the row's Claim pill.
  const handleClaimAction = useCallback(async (quest: ApiQuest) => {
    const ready = quest.levels.find((level) => level.status === 'COMPLETED');
    if (!ready) return;
    try {
      await apiClaimLevel(ready.id);
      const data = await apiGetQuests();
      setQuests(data.quests);
    } catch {
      // Claim did not go through; the card keeps its current state.
    }
  }, []);

  return (
    <View className="mt-[30px]">
      <View className="flex-row items-center justify-between">
        <Text style={{ fontFamily: wuzyFonts.bold, fontSize: wuzyType.body, color: wuzyColors.yellow }}>
          Tasks
        </Text>
        <View className="rounded-full border border-wuzy-yellow/30 bg-wuzy-yellow/15 px-[12px] py-[5px]">
          <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.caption, color: wuzyColors.yellow }}>
            {readyCount} Ready
          </Text>
        </View>
      </View>

      <Text
        style={{
          marginTop: 4,
          fontFamily: wuzyFonts.body,
          fontSize: wuzyType.small,
          color: wuzyColors.gray,
        }}>
        Complete tasks to collect exclusive badges
      </Text>

      <View className="mt-[16px] gap-[12px]">
        {quests.map((quest) => {
          const action = QUEST_ACTIONS[quest.name];
          const asClaim = Boolean(action?.asClaim);
          // Claim actions only fire once a step is complete (yellow bar full).
          const claimReady = quest.levels.some((level) => level.status === 'COMPLETED');
          return (
            <QuestCard
              key={quest.id}
              quest={quest}
              actionLabel={action?.label}
              actionEnabled={asClaim ? claimReady : undefined}
              onAction={
                asClaim
                  ? () => handleClaimAction(quest)
                  : action?.route
                    ? () => router.push(action.route!)
                    : undefined
              }
              onClaim={handleClaim}
            />
          );
        })}
      </View>
    </View>
  );
}