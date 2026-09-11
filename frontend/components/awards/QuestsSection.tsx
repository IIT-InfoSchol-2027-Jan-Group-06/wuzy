import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { QuestCard } from '@/components/awards/QuestCard';
import { wuzyColors, wuzyFonts, wuzyType } from '@/constants/wuzy-theme';
import type { ApiQuest } from '@/lib/api';

/** Maps each task to its right-column action (or none). */
const actionFor: Record<string, { label: string; route: string }> = {
  'Attend Live Events': { label: 'Attend', route: '/event-details' },
  'Social Network': { label: 'Add', route: '/connect' },
  'Ticket Sharing': { label: 'Share', route: '/ticket-vault' },
};

interface QuestsSectionProps {
  quests: ApiQuest[];
  onClaimed?: () => void;
}

/** Tasks header, then the three subtask-based task cards. */
export function QuestsSection({ quests, onClaimed }: QuestsSectionProps) {
  const router = useRouter();

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
          const action = actionFor[quest.name];
          return (
            <QuestCard
              key={quest.id}
              quest={quest}
              actionLabel={action?.label}
              onAction={action ? () => router.push(action.route as never) : undefined}
              onClaimed={onClaimed}
            />
          );
        })}
      </View>
    </View>
  );
}