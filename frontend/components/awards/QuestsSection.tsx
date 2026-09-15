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
  'Complete Profile': { label: 'Complete', route: '/(tabs)/profile' },
  'Purchase Ticket': { label: 'Purchase', route: '/ticket' },
};

interface QuestsSectionProps {
  quests: ApiQuest[];
  onClaimed?: () => void;
  completedTasks?: Set<string>;
  onClaimTask?: (name: string) => () => Promise<void>;
  /** How many tickets the user has bought; drives the Purchase Ticket progress. */
  ticketCount?: number;
}

/** Tasks header, then the task cards including quests and custom tasks. */
export function QuestsSection({ quests, onClaimed, completedTasks, onClaimTask, ticketCount }: QuestsSectionProps) {
  const router = useRouter();

  const taskNames = ['Purchase Ticket', 'Complete Profile'];
  const taskDescriptions: Record<string, string> = {
    'Purchase Ticket': 'Buy 5 tickets to fill the bar',
    'Complete Profile': 'Fill in your profile to earn 100 XP',
  };

  // Display order: Daily Login leads the board, Ticket Sharing closes it.
  const taskOrder = [
    'Daily Login',
    'Attend Live Events',
    'Social Network',
    'Purchase Ticket',
    'Complete Profile',
    'Ticket Sharing',
  ];

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
        {taskOrder.map((name) => {
          if (taskNames.includes(name)) {
            const isPurchaseTicket = name === 'Purchase Ticket';
            const purchaseCount = Math.min(5, ticketCount ?? 0);
            const isDone = isPurchaseTicket ? purchaseCount >= 5 : (completedTasks?.has(name) ?? false);
            const action = actionFor[name];
            const actionLabel = action?.label ?? (name === 'Purchase Ticket' ? 'Purchase' : 'Complete');
            return (
              <QuestCard
                key={name}
                quest={{
                  id: name === 'Complete Profile' ? -2 : -1,
                  name,
                  description: taskDescriptions[name],
                  active_subtask: isDone ? null : {
                    id: 0,
                    name,
                    description: taskDescriptions[name],
                    target_count: isPurchaseTicket ? 5 : 1,
                    progress_unit: isPurchaseTicket ? 'times' : 'once',
                    reward_xp: name === 'Purchase Ticket' ? 50 : 100,
                    reward_sticker: false,
                    current_progress: isPurchaseTicket ? purchaseCount : 0,
                    claimed: false,
                  },
                  subtask_step: 1,
                  subtask_total: 1,
                  claimed_steps: isDone ? 1 : 0,
                }}
                actionLabel={actionLabel}
                onAction={action ? () => router.push(action.route as never) : undefined}
                onClaimed={onClaimed}
                onClaimCustom={action ? undefined : onClaimTask?.(name)}
              />
            );
          }
          const quest = quests.find((q) => q.name === name);
          if (!quest) return null;
          const action = actionFor[name];
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