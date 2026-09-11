import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { TabHeader } from '@/components/TabHeader';
import { BadgeGrid } from '@/components/awards/BadgeGrid';
import { QuestsSection } from '@/components/awards/QuestsSection';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { apiGetQuests, type ApiQuest } from '@/lib/api';

export default function AwardsScreen() {
  const [quests, setQuests] = useState<ApiQuest[]>([]);

  const loadQuests = useCallback(() => {
    apiGetQuests()
      .then((data) => setQuests(data.quests))
      .catch(() => setQuests([]));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadQuests();
    }, [loadQuests]),
  );

  // A task's sticker is earned the first time one of its steps is claimed;
  // a fully claimed task (active_subtask null) also keeps its sticker.
  // Ticket Sharing's blue sticker is not shown on the board.
  const earned = quests
    .filter((q) => q.claimed_steps > 0)
    .map((q) => q.name)
    .filter((n) => n !== 'Ticket Sharing');

  return (
    <Screen scroll style={{ gap: wuzyLayout.gap }}>
      <TabHeader title="Awards" />
      <View>
        <Text style={{ fontFamily: wuzyFonts.bold, fontSize: wuzyType.body, color: wuzyColors.yellow }}>
          Tasks and Sticker Board
        </Text>
        <View style={{ marginTop: wuzyLayout.itemGap }}>
          <BadgeGrid earned={earned} />
        </View>
        <QuestsSection quests={quests} onClaimed={loadQuests} />
      </View>
    </Screen>
  );
}