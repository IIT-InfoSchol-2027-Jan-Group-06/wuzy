import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import { QuestCard } from '@/components/awards/QuestCard';
import { wuzyColors, wuzyFonts, wuzyType } from '@/constants/wuzy-theme';
import { apiGetQuests, type ApiQuest } from '@/lib/api';

/** Tasks header, then the three flat task cards. */
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

  // The second and third tasks have an in-app action that earns them, so their
  // cards carry a button that jumps straight to the screen where it happens.
  const actionFor = (quest: ApiQuest): { label: string; onPress: () => void } | undefined => {
    if (quest.name === 'Social Network') return { label: 'Add', onPress: () => router.push('/connect') };
    if (quest.name === 'Ticket Sharing') return { label: 'Share', onPress: () => router.push('/ticket-vault') };
    return undefined;
  };

  return (
    <View className="mt-[30px]">
      <Text style={{ fontFamily: wuzyFonts.bold, fontSize: wuzyType.body, color: wuzyColors.yellow }}>
        Tasks
      </Text>

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
          const action = actionFor(quest);
          return (
            <QuestCard
              key={quest.id}
              quest={quest}
              actionLabel={action?.label}
              onAction={action?.onPress}
            />
          );
        })}
      </View>
    </View>
  );
}