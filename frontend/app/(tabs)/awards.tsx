import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';

import { QuestsSection } from '@/components/awards/QuestsSection';
import { RankCard } from '@/components/awards/RankCard';
import { Screen } from '@/components/Screen';
import { TabHeader } from '@/components/TabHeader';
import { earnedSlots } from '@/constants/awards-data';
import { wuzyColors, wuzyLayout } from '@/constants/wuzy-theme';
import { useQuests } from '@/hooks/useQuests';

export default function AwardsScreen() {
  const router = useRouter();
  const { dashboard, previous, claiming, claim } = useQuests();

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
            badgesEarned={earnedSlots(dashboard).filter(Boolean).length}
            badgesTotal={dashboard.deck.length}
            onBadgesPress={() => router.push('/badges')}
          />
          <QuestsSection quests={dashboard.quests} claiming={claiming} onClaim={claim} />
        </>
      )}
    </Screen>
  );
}
