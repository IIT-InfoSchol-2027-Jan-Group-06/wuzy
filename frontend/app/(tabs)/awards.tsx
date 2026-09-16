import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Celebration, type CelebrationData } from '@/components/awards/Celebration';
import { QuestsSection } from '@/components/awards/QuestsSection';
import { RankCard } from '@/components/awards/RankCard';
import { Screen } from '@/components/Screen';
import { TabHeader } from '@/components/TabHeader';
import { RANK_SLOT, deckImage, earnedSlots } from '@/constants/awards-data';
import { wuzyColors, wuzyLayout } from '@/constants/wuzy-theme';
import { useQuests } from '@/hooks/useQuests';

export default function AwardsScreen() {
  const router = useRouter();
  const { dashboard, previous, claiming, claim } = useQuests();
  const [celebration, setCelebration] = useState<CelebrationData | null>(null);

  // Diff the dashboard shown at tap time against the one the claim returns; a
  // failed claim throws through to the card, which shows the note.
  const handleClaim = async (key: string) => {
    const before = dashboard;
    const after = await claim(key);
    const oldQuest = before?.quests.find((q) => q.key === key);
    const newQuest = after.quests.find((q) => q.key === key);
    if (!before || !oldQuest || !newQuest || oldQuest.active_tier_index == null) return;
    const tier = oldQuest.tiers[oldQuest.active_tier_index];
    setCelebration({
      questName: newQuest.name,
      tierName: tier.name,
      xp: tier.reward_xp,
      badge: newQuest.completed && !oldQuest.completed ? deckImage(after.deck, newQuest.sort_order) : undefined,
      rankUp:
        after.xp.rank_index > before.xp.rank_index
          ? { rank: after.xp.rank, badge: deckImage(after.deck, RANK_SLOT + after.xp.rank_index) }
          : undefined,
    });
  };

  return (
    <Screen scroll style={{ gap: wuzyLayout.gap }}>
      <TabHeader title="Awards" />
      {!dashboard ? (
        <View style={{ paddingVertical: wuzyLayout.gap }}>
          <ActivityIndicator color={wuzyColors.yellow} />
        </View>
      ) : (
        <>
          <RankCard
            xp={dashboard.xp}
            deck={dashboard.deck}
            previousRankIndex={previous?.xp.rank_index ?? null}
          />
          <QuestsSection
            quests={dashboard.quests}
            claiming={claiming}
            onClaim={handleClaim}
            badgesEarned={earnedSlots(dashboard).filter(Boolean).length}
            badgesTotal={dashboard.deck.length}
            onBadgesPress={() => router.push('/badges')}
          />
        </>
      )}
      <Celebration celebration={celebration} onClose={() => setCelebration(null)} />
    </Screen>
  );
}
