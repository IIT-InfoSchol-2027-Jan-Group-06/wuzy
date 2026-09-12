import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { TabHeader } from '@/components/TabHeader';
import { QuestsSection } from '@/components/awards/QuestsSection';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { apiGetQuests, type ApiQuest } from '@/lib/api';

const stickerBoardImage = require('@/assets/badges/image.png');

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

  return (
    <Screen scroll style={{ gap: wuzyLayout.gap, paddingBottom: 96 }}>
      <TabHeader title="Awards" />
      <View>
        <Text style={{ fontFamily: wuzyFonts.bold, fontSize: wuzyType.body, color: wuzyColors.yellow }}>
          Tasks and Sticker Board
        </Text>
        <View style={{ marginTop: 6, alignItems: 'center' }}>
          <Text
            className="text-center"
            style={{
              fontFamily: wuzyFonts.semibold,
              fontSize: 13,
              color: wuzyColors.yellowMuted,
              paddingVertical: 6,
            }}>
            Complete a task to earn its badge
          </Text>
          <Image
            source={stickerBoardImage}
            style={{ width: 150, height: 150, resizeMode: 'contain' }}
          />
        </View>
        <QuestsSection quests={quests} onClaimed={loadQuests} />
      </View>
    </Screen>
  );
}