import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { apiGetEvent, assetUrl, type ApiRecommendedEvent } from '@/lib/api';

const card = { backgroundColor: wuzyColors.surface, borderRadius: 24, borderWidth: 1, borderColor: wuzyColors.glassBorder };

export default function TicketScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { width } = useWindowDimensions();
  const [event, setEvent] = useState<ApiRecommendedEvent | null>(null);
  const [ticketCount, setTicketCount] = useState(1);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (id) {
          const found = await apiGetEvent(Number(id));
          if (active) setEvent(found);
        }
      } catch {
        // Leave event null; the screen shows the empty state below.
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const priceMatch = (event?.price ?? '').match(/([^\d]*)([\d,]+)/);
  const currency = priceMatch?.[1]?.trim() || '₦';
  const ticketPrice = Number((priceMatch?.[2] ?? '').replace(/,/g, '')) || 0;
  const formatPrice = (value: number) => `${currency}${value.toLocaleString()}`;
  const total = ticketPrice * ticketCount;
  const bannerHeight = Math.min(Math.round((width - 2 * wuzyLayout.side) * 0.42), 180);

  const stepper = (icon: 'remove' | 'add', onPress: () => void) => (
    <Pressable onPress={onPress} accessibilityRole="button" className="w-10 h-10 rounded-full items-center justify-center active:opacity-70" style={{ backgroundColor: wuzyColors.yellowDim }}>
      <Ionicons name={icon} size={20} color={wuzyColors.white} />
    </Pressable>
  );

  return (
    <Screen>
      <ScreenHeader title="Ticket" />

      {!event ? (
        <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.body, color: wuzyColors.gray }}>
          This event is no longer available.
        </Text>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: wuzyLayout.gap, gap: wuzyLayout.gap }} showsVerticalScrollIndicator={false}>
          <View style={[card, { overflow: 'hidden' }]}>
            <Image source={{ uri: assetUrl(event.image_url ?? '') }} style={{ width: '100%', height: bannerHeight }} contentFit="cover" />
            <View style={{ padding: 16, gap: 4 }}>
              <Text className="text-wuzy-yellow uppercase" numberOfLines={1} style={{ fontFamily: wuzyFonts.display, fontSize: wuzyType.title }}>
                {event.title}
              </Text>
              <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.small, color: wuzyColors.white }}>
                {new Date(event.start_time).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </Text>
              <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.gray }}>
                {event.venue}
                {event.venue && event.location ? ', ' : ''}
                {event.location}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between" style={[card, { padding: 16 }]}>
            <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body, color: wuzyColors.white }}>Tickets</Text>
            <View className="flex-row items-center">
              {stepper('remove', () => setTicketCount((count) => Math.max(1, count - 1)))}
              <Text className="min-w-[40px] text-center" style={{ fontFamily: wuzyFonts.bold, fontSize: wuzyType.body, color: wuzyColors.yellow }}>
                {ticketCount}
              </Text>
              {stepper('add', () => setTicketCount((count) => Math.min(10, count + 1)))}
            </View>
          </View>

          <View style={[card, { padding: 16, gap: wuzyLayout.itemGap }]}>
            <View className="flex-row justify-between">
              <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.gray }}>
                {ticketCount} x {formatPrice(ticketPrice)}
              </Text>
              <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.body, color: wuzyColors.white }}>{formatPrice(total)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body, color: wuzyColors.white }}>Total</Text>
              <Text style={{ fontFamily: wuzyFonts.bold, fontSize: wuzyType.body, color: wuzyColors.yellow }}>{formatPrice(total)}</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {event && (
        <Pressable
          onPress={() => router.push('/ticket-vault')}
          accessibilityRole="button"
          className="items-center justify-center rounded-full active:opacity-80"
          style={{ height: wuzyLayout.control, marginBottom: wuzyLayout.itemGap, backgroundColor: wuzyColors.yellow }}>
          <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body, color: wuzyColors.bg }}>Pay {formatPrice(total)}</Text>
        </Pressable>
      )}
    </Screen>
  );
}