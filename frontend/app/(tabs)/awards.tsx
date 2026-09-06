import { Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { TabHeader } from '@/components/TabHeader';
import { BadgeGrid } from '@/components/awards/BadgeGrid';
import { TasksSection } from '@/components/awards/TasksSection';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

export default function AwardsScreen() {
  return (
    <Screen scroll style={{ gap: wuzyLayout.gap }}>
      <TabHeader title="Awards" />
      <View>
        <Text style={{ fontFamily: wuzyFonts.bold, fontSize: wuzyType.body, color: wuzyColors.yellow }}>
          Awards Badges and Sticker Board
        </Text>
        <View style={{ marginTop: wuzyLayout.itemGap }}>
          <BadgeGrid />
        </View>
        <TasksSection />
      </View>
    </Screen>
  );
}
