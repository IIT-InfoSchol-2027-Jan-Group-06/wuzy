import { useCallback, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, Pressable, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { ScreenHeader } from '@/components/ScreenHeader';
import { TicketCard, type TicketCardData } from '@/components/TicketCard';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { apiGetTickets, apiShareTicket, assetUrl, type ApiTicketRead } from '@/lib/api';

const CARD_GAP = 16;
const fallbackArt = require('@/assets/images/event1.jpg');

/** Shape an API ticket for the card. Legacy tickets without an event get generic art. */
function toCard(t: ApiTicketRead): TicketCardData {
  const when = t.event
    ? new Date(t.event.start_time)
        .toLocaleString('en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
        .toUpperCase()
    : '';
  return {
    id: t.id,
    image: t.event?.image_url ? { uri: assetUrl(t.event.image_url) } : fallbackArt,
    title: t.event?.title.toUpperCase() ?? 'WUZY TICKET',
    date: when,
    venue: t.event?.venue?.toUpperCase() ?? '',
    code: `WZ-TKT-${String(t.id).padStart(4, '0')}`,
  };
}

/** Blurred active-ticket art fills the whole screen, so this route composes the shell by hand instead of using Screen. */
export default function TicketVaultScreen() {
  const { width } = useWindowDimensions();
  const [tickets, setTickets] = useState<TicketCardData[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      apiGetTickets()
        .then((rows) => {
          if (active) setTickets(rows.map(toCard));
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, []),
  );

  const cardWidth = Math.min(Math.round(width * 0.78), 360);
  const sidePadding = (width - cardWidth) / 2;
  const activeTicket = tickets[activeIndex] ?? tickets[0];

  const handleShare = useCallback(async (ticket: TicketCardData) => {
    try {
      const result = await Share.share({
        message: `${ticket.title}\n${ticket.date}\n${ticket.venue}\nJoin me on Wuzy!`,
      });
      // ponytail: Android always reports sharedAction, so the count is optimistic there.
      if (result.action === Share.sharedAction) apiShareTicket(ticket.id).catch(() => {});
    } catch {
      // Share sheet not supported; nothing to count.
    }
  }, []);

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (cardWidth + CARD_GAP));
    setActiveIndex(Math.max(0, Math.min(index, tickets.length - 1)));
  };

  return (
    <View className="flex-1 bg-wuzy-bg">
      {activeTicket && (
        <Image key={activeTicket.id} source={activeTicket.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} blurRadius={20} />
      )}
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
          {tickets.length === 0 ? (
            <Text
              className="text-center"
              style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.body, color: wuzyColors.gray, paddingHorizontal: wuzyLayout.side }}>
              No tickets yet. Buy one from an event to see it here.
            </Text>
          ) : (
            <FlatList
              data={tickets}
              keyExtractor={(item) => String(item.id)}
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
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
