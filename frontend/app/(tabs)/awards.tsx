import { Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { TabHeader } from '@/components/TabHeader';
import { wuzyColors, wuzyFonts, wuzyLayout } from '@/constants/wuzy-theme';
import { useResponsive } from '@/hooks/useResponsive';

export default function AwardsScreen() {
  const { fontSize } = useResponsive();

  return (
    <Screen scroll style={{ gap: wuzyLayout.gap }}>
      <TabHeader title="Awards" />
      <View className="items-center" style={{ marginTop: wuzyLayout.gap }}>
        <Text style={{ fontFamily: wuzyFonts.body, fontSize: fontSize('body'), color: wuzyColors.gray }}>
          Awards are on the way. Check back after the first events.
        </Text>
      </View>
    </Screen>
  );
}
