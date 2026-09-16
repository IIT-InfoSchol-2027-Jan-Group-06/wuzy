import { useRouter, type Href } from 'expo-router';
import { Text, View } from 'react-native';

import { QuestCard } from '@/components/awards/QuestCard';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import type { ApiQuest } from '@/lib/api';

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

/** Every unfinished quest in catalog order, each card wired to its claim and action. */
export function QuestsSection({ quests, claiming, onClaim }: QuestsSectionProps) {
  const router = useRouter();
  const rows = quests.filter((q) => !q.completed).sort((a, b) => a.sort_order - b.sort_order);
  return (
    <View style={{ gap: wuzyLayout.itemGap }}>
      <View>
        <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.section, color: wuzyColors.yellow }}>
          Quests
        </Text>
        <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.gray }}>
          Do the thing, claim the reward
        </Text>
      </View>
      {rows.length === 0 && (
        <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.gray }}>
          Every quest is done. New ones are coming.
        </Text>
      )}
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
}
