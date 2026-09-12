import { useCallback, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, Pressable, Share, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { ScreenHeader } from '@/components/ScreenHeader';
import { TicketCard } from '@/components/TicketCard';
import { tickets, type Ticket } from '@/constants/ticket-data';
import { wuzyLayout } from '@/constants/wuzy-theme';
import { apiBumpQuestProgress, apiGetQuests } from '@/lib/api';

const CARD_GAP = 16;

// Each native share counts one action toward the Ticket Sharing task.
const TICKET_QUEST = 'Ticket Sharing';

/** Blurred active-ticket art fills the whole screen, so this route composes the shell by hand instead of using Screen. */
export default function TicketVaultScreen() {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const cardWidth = Math.min(Math.round(width * 0.78), 360);
  const sidePadding = (width - cardWidth) / 2;
  const activeTicket = tickets[activeIndex] ?? tickets[0];

  const handleShare = useCallback(async (ticket: Ticket) => {
    try {
      const data = await apiGetQuests();
      const quest = data.quests.find((q) => q.name === TICKET_QUEST);
      if (quest) {
        await apiBumpQuestProgress(quest.id);
      }
    } catch {
      // Keeps the count unchanged; the bump did not go through.
    }
    try {
      await Share.share({
        message: `${ticket.title}\n${ticket.date}\n${ticket.venue}\nJoin me on Wuzy!`,
      });
    } catch {
      // Share sheet dismissed or not supported; nothing to do.
    }
  }, []);

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (cardWidth + CARD_GAP));
    setActiveIndex(Math.max(0, Math.min(index, tickets.length - 1)));
  };

  return (
    <View className="flex-1 bg-wuzy-bg">
      <Image key={activeTicket.id} source={activeTicket.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} blurRadius={20} />
      <LinearGradient
        colors={['rgba(10, 15, 23, 0.38)', 'rgba(10, 15, 23, 0.5)', 'rgba(10, 15, 23, 0.64)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <View style={{ paddingTop: wuzyLayout.top, paddingHorizontal: wuzyLayout.side }}>
          <ScreenHeader title="Tickets" />
        </View>

        <View className="flex-1 justify-center">
          <FlatList
            data={tickets}
            keyExtractor={(item: Ticket) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + CARD_GAP}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: sidePadding, alignItems: 'center' }}
            ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            getItemLayout={(_, index) => ({ length: cardWidth + CARD_GAP, offset: (cardWidth + CARD_GAP) * index, index })}
            renderItem={({ item }) => (
              <Pressable onPress={() => handleShare(item)} accessibilityRole="button" className="active:opacity-80">
                <TicketCard ticket={item} width={cardWidth} />
              </Pressable>
            )}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}