import { ActivityIndicator, View } from 'react-native';

import { QuestsSection } from '@/components/awards/QuestsSection';
import { RankCard } from '@/components/awards/RankCard';
import { StickerGrid } from '@/components/awards/StickerGrid';
import { Screen } from '@/components/Screen';
import { TabHeader } from '@/components/TabHeader';
import { wuzyColors, wuzyLayout } from '@/constants/wuzy-theme';
import { useQuests } from '@/hooks/useQuests';

export default function AwardsScreen() {
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
          <RankCard xp={dashboard.xp} deck={dashboard.deck} previousRankIndex={previous?.xp.rank_index ?? null} />
          <StickerGrid dashboard={dashboard} previous={previous} />
          <QuestsSection quests={dashboard.quests} claiming={claiming} onClaim={claim} />
        </>
      )}
    </Screen>
  );
}
