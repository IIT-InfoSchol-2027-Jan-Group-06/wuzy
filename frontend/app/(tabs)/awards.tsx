import { Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { TabHeader } from '@/components/TabHeader';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

export default function AwardsScreen() {

  return (
    <Screen scroll style={{ gap: wuzyLayout.gap }}>
      <TabHeader title="Awards" />
      <View className="items-center">
        <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.body, color: wuzyColors.gray }}>
          Awards are on the way. Check back after the first events.
        </Text>
      </View>
    </Screen>
  );
}
