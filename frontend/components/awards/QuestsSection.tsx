import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { QuestCard } from '@/components/awards/QuestCard';
import { wuzyColors, wuzyFonts, wuzyType } from '@/constants/wuzy-theme';
import { apiRecordDailyLogin, type ApiQuest } from '@/lib/api';

/** Maps each task to its right-column action (or none). */
const actionFor: Record<string, { label: string; route: string }> = {
  'Attend Live Events': { label: 'Attend', route: '/event-details' },
  'Social Network': { label: 'Add', route: '/connect' },
  'Ticket Sharing': { label: 'Share', route: '/ticket-vault' },
  'Complete Profile': { label: 'Complete', route: '/(tabs)/profile' },
};

interface QuestsSectionProps {
  quests: ApiQuest[];
  onClaimed?: () => void;
  completedTasks?: Set<string>;
  onClaimTask?: (name: string) => () => Promise<void>;
}

/** Tasks header, then the task cards including quests and custom tasks. */
export function QuestsSection({ quests, onClaimed, completedTasks, onClaimTask }: QuestsSectionProps) {
  const router = useRouter();

  const taskNames = ['Purchase Ticket', 'Complete Profile'];
  const taskDescriptions: Record<string, string> = {
    'Purchase Ticket': 'Buy a ticket to earn 50 XP',
    'Complete Profile': 'Fill in your profile to earn 100 XP',
  };

  return (
    <View className="mt-[16px]">
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
          if (quest.name === 'Daily Login') {
            return (
              <QuestCard
                key={quest.id}
                quest={quest}
                actionLabel="Login"
                onAction={async () => {
                  await apiRecordDailyLogin();
                  onClaimed?.();
                }}
                onClaimed={onClaimed}
              />
            );
          }
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
        {taskNames.map((name) => {
          const isDone = completedTasks?.has(name) ?? false;
          const action = actionFor[name];
          const actionLabel = action?.label ?? (name === 'Purchase Ticket' ? 'Purchase' : 'Complete');
          if (action && name !== 'Purchase Ticket') {
            return (
              <QuestCard
                key={name}
                quest={{
                  id: name === 'Complete Profile' ? -2 : -1,
                  name,
                  description: taskDescriptions[name],
                  active_subtask: isDone ? null : { id: 0, quest_id: 0, name: name, description: taskDescriptions[name], target_count: 1, progress_unit: 'once', reward_xp: name === 'Purchase Ticket' ? 50 : 100, reward_sticker: false, current_progress: 0, claimed: false },
                  subtask_step: 1,
                  subtask_total: 1,
                  claimed_steps: isDone ? 1 : 0,
                }}
                actionLabel={actionLabel}
                onAction={() => router.push(action.route as never)}
                onClaimed={onClaimed}
              />
            );
          }
          return (
            <QuestCard
              key={name}
              quest={{
                id: -1,
                name,
                description: taskDescriptions[name],
                active_subtask: isDone ? null : { id: 0, quest_id: 0, name: name, description: taskDescriptions[name], target_count: 1, progress_unit: 'once', reward_xp: 50, reward_sticker: false, current_progress: 0, claimed: false },
                subtask_step: 1,
                subtask_total: 1,
                claimed_steps: isDone ? 1 : 0,
              }}
              actionLabel={actionLabel}
              onClaimed={onClaimed}
              onClaimCustom={onClaimTask?.(name)}
            />
          );
        })}
      </View>
    </View>
  );
}