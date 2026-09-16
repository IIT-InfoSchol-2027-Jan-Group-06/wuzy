import { ActivityIndicator, Text, View } from 'react-native';

import { StickerGrid } from '@/components/awards/StickerGrid';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { useQuests } from '@/hooks/useQuests';

/** Every badge in the user's deck, earned or still locked. */
export default function BadgesScreen() {
  const { dashboard } = useQuests();
  return (
    <Screen scroll style={{ gap: wuzyLayout.gap }}>
      <ScreenHeader title="Badges" />
      <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.gray }}>
        Finish a quest to earn its badge. Each rank comes with one too.
      </Text>
      {dashboard ? (
        <StickerGrid dashboard={dashboard} />
      ) : (
        <View style={{ paddingVertical: wuzyLayout.gap }}>
          <ActivityIndicator color={wuzyColors.yellow} />
        </View>
      )}
    </Screen>
  );
}
