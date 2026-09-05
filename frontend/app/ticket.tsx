import { useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader } from '@/components/ScreenHeader';
import { mockEvent } from '@/constants/event-data';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

const ticketPrice = Number(mockEvent.price?.replace(/[^0-9]/g, '')) || 0;

const formatPrice = (value: number) => `₦${value.toLocaleString()}`;

export default function TicketScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const [ticketCount, setTicketCount] = useState(1);

  const bodyFontSize = Math.round(screenWidth * 0.037);
  const smallFontSize = Math.round(screenWidth * 0.03);
  const total = ticketPrice * ticketCount;

  return (
    <View className="flex-1" style={{ backgroundColor: wuzyColors.bg }}>
      <SafeAreaView edges={['top', 'bottom']} className="flex-1" style={{ backgroundColor: wuzyColors.bg }}>
        <ScreenHeader title="TICKET" />

        <ScrollView className="flex-1" contentContainerClassName="px-[24px] pb-[24px]" showsVerticalScrollIndicator={false}>
          {/* Event summary */}
          <View style={{ borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <Image source={mockEvent.image} style={{ width: '100%', height: Math.round(screenWidth * 0.42) }} contentFit="cover" />
            <View className="px-[20px] py-[18px] gap-[6px]" style={{ backgroundColor: wuzyColors.surface }}>
              <Text
                className="text-wuzy-yellow uppercase"
                numberOfLines={1}
                style={{ fontFamily: wuzyFonts.bold, fontSize: Math.round(screenWidth * 0.045), letterSpacing: 1 }}
              >
                {mockEvent.title}
              </Text>
              <Text style={{ fontFamily: wuzyFonts.medium, fontSize: smallFontSize, color: wuzyColors.white }}>
                {mockEvent.date} · {mockEvent.time}
              </Text>
              <Text style={{ fontFamily: wuzyFonts.body, fontSize: smallFontSize, color: wuzyColors.gray }}>
                {mockEvent.venue}, {mockEvent.location}
              </Text>
            </View>
          </View>

          {/* Ticket quantity */}
          <View className="mt-[24px] flex-row items-center justify-between" style={{ backgroundColor: wuzyColors.surface, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: bodyFontSize, color: wuzyColors.white }}>
              Tickets
            </Text>
            <View className="flex-row items-center">
              <Pressable
                onPress={() => setTicketCount((count) => Math.max(1, count - 1))}
                className="w-10 h-10 rounded-full items-center justify-center bg-white/10 active:opacity-70"
              >
                <Ionicons name="remove" size={20} color={wuzyColors.white} />
              </Pressable>
              <Text className="min-w-[40px] text-center" style={{ fontFamily: wuzyFonts.bold, fontSize: bodyFontSize, color: wuzyColors.yellow }}>
                {ticketCount}
              </Text>
              <Pressable
                onPress={() => setTicketCount((count) => Math.min(10, count + 1))}
                className="w-10 h-10 rounded-full items-center justify-center bg-white/10 active:opacity-70"
              >
                <Ionicons name="add" size={20} color={wuzyColors.white} />
              </Pressable>
            </View>
          </View>

          {/* Order summary */}
          <View className="mt-[16px] gap-[12px]" style={{ backgroundColor: wuzyColors.surface, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <View className="flex-row justify-between">
              <Text style={{ fontFamily: wuzyFonts.body, fontSize: smallFontSize, color: wuzyColors.gray }}>
                {ticketCount} × {formatPrice(ticketPrice)}
              </Text>
              <Text style={{ fontFamily: wuzyFonts.medium, fontSize: bodyFontSize, color: wuzyColors.white }}>
                {formatPrice(total)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: bodyFontSize, color: wuzyColors.white }}>
                Total
              </Text>
              <Text style={{ fontFamily: wuzyFonts.bold, fontSize: bodyFontSize, color: wuzyColors.yellow }}>
                {formatPrice(total)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Checkout CTA */}
        <View className="px-[24px] pb-[24px] pt-[12px]">
          <Pressable
            onPress={() => {}}
            className="rounded-full overflow-hidden active:opacity-80"
            style={{ height: Math.round(screenWidth * 0.13), backgroundColor: wuzyColors.yellow }}
          >
            <View className="flex-1 items-center justify-center">
              <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: Math.round(screenWidth * 0.04), color: wuzyColors.bg }}>
                Pay {formatPrice(total)}
              </Text>
            </View>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}