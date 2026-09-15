import { useRouter, type Href } from 'expo-router';
import { Text, View } from 'react-native';

import { QuestCard } from '@/components/awards/QuestCard';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import type { ApiQuest, QuestCategory } from '@/lib/api';

const GROUPS: { category: QuestCategory; title: string; subtitle: string }[] = [
  { category: 'social', title: 'Social', subtitle: 'Grow your circle' },
  { category: 'events', title: 'Events', subtitle: 'Get out there' },
  { category: 'habits', title: 'Habits', subtitle: 'Show up every day' },
];

/** Where each quest's action pill takes the user. Quests missing here show "Auto". */
const ACTIONS: Record<string, { label: string; route: Href }> = {
  social_network: { label: 'Add', route: '/connect' },
  matchmaker: { label: 'Refer', route: '/connections' },
  squad_up: { label: 'Group', route: '/new-group' },
  explorer: { label: 'Explore', route: '/(tabs)/explore' },
  ticket_holder: { label: 'Buy', route: '/ticket' },
  ticket_sharing: { label: 'Share', route: '/ticket-vault' },
  gift_giver: { label: 'Gift', route: '/(tabs)/explore' },
  complete_profile: { label: 'Edit', route: '/edit-profile' },
};

interface QuestsSectionProps {
  quests: ApiQuest[];
  claiming: string | null;
  onClaim: (key: string) => Promise<void>;
}

/** The quest lines grouped by category, each card wired to its claim and action. */
export function QuestsSection({ quests, claiming, onClaim }: QuestsSectionProps) {
  const router = useRouter();
  return (
    <View style={{ gap: wuzyLayout.gap }}>
      {GROUPS.map(({ category, title, subtitle }) => {
        const rows = quests.filter((q) => q.category === category).sort((a, b) => a.sort_order - b.sort_order);
        if (rows.length === 0) return null;
        return (
          <View key={category} style={{ gap: wuzyLayout.itemGap }}>
            <View>
              <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.section, color: wuzyColors.yellow }}>
                {title}
              </Text>
              <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.gray }}>
                {subtitle}
              </Text>
            </View>
            {rows.map((quest) => {
              const action = ACTIONS[quest.key];
              return (
                <QuestCard
                  key={quest.key}
                  quest={quest}
                  action={action ? { label: action.label, onPress: () => router.push(action.route) } : { label: 'Auto' }}
                  claiming={claiming === quest.key}
                  onClaim={() => onClaim(quest.key)}
                />
              );
            })}
          </View>
        );
      })}
    </View>
  );
}
