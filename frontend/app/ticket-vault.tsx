import { useCallback, useEffect, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, Pressable, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ScreenHeader } from '@/components/ScreenHeader';
import { TicketCard } from '@/components/TicketCard';
import { tickets, type Ticket } from '@/constants/ticket-data';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { apiBumpTaskProgress, apiGetAwards } from '@/lib/api';

const CARD_GAP = 16;

/** Blurred active-ticket art fills the whole screen, so this route composes the shell by hand instead of using Screen. */
export default function TicketVaultScreen() {
  const { width } = useWindowDimensions();
  const { taskId } = useLocalSearchParams<{ taskId?: string }>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [shareTarget, setShareTarget] = useState(0);

  const cardWidth = Math.min(Math.round(width * 0.78), 360);
  const sidePadding = (width - cardWidth) / 2;
  const activeTicket = tickets[activeIndex] ?? tickets[0];

  // Opened from the Awards "Share an Event Ticket" task: count completed shares
  // toward progress, shown as events shared / events needed.
  useEffect(() => {
    if (!taskId) return;
    let active = true;
    apiGetAwards()
      .then((data) => {
        if (!active) return;
        const task = data.tasks.find((t) => t.id === Number(taskId));
        setShareCount(task?.current_progress ?? 0);
        setShareTarget(task?.target_progress ?? 0);
      })
      .catch(() => {
        if (!active) return;
        setShareCount(0);
        setShareTarget(0);
      });
    return () => {
      active = false;
    };
  }, [taskId]);

  // The Events-you-get bar slides forward on each share instead of snapping.
  const barProgress = useSharedValue(0);

  useEffect(() => {
    barProgress.value = withTiming(
      shareTarget > 0 ? Math.min(1, shareCount / shareTarget) : 0,
      { duration: 450, easing: Easing.out(Easing.quad) },
    );
  }, [shareCount, shareTarget, barProgress]);

  const barWidth = useAnimatedStyle(() => ({
    width: `${barProgress.value * 100}%`,
  }));

  const refreshShare = useCallback(async () => {
    if (!taskId) return;
    try {
      const data = await apiGetAwards();
      const task = data.tasks.find((t) => t.id === Number(taskId));
      setShareCount(task?.current_progress ?? 0);
      setShareTarget(task?.target_progress ?? 0);
    } catch {
      setShareCount(0);
      setShareTarget(0);
    }
  }, [taskId]);

  const handleShare = async (ticket: Ticket) => {
    if (taskId) {
      try {
        await apiBumpTaskProgress(Number(taskId));
        await refreshShare();
      } catch {
        // Keep the count unchanged; the bump did not go through.
      }
    }
    try {
      await Share.share({
        message: `${ticket.title}\n${ticket.date}\n${ticket.venue}\nJoin me on Wuzy!`,
      });
    } catch {
      // Share sheet dismissed or not supported; the count already went through.
    }
  };

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

        {shareTarget > 0 && (
          <View className="mx-[16px] mb-[8px] gap-[12px] rounded-2xl border border-white/10 bg-[#0B0E14]/70 p-4">
            <View className="flex-row items-center justify-between">
              <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.yellow }}>
                Events you get
              </Text>
              <Text style={{ fontFamily: wuzyFonts.bold, fontSize: wuzyType.small, color: wuzyColors.white }}>
                {shareCount} / {shareTarget}
              </Text>
            </View>
            <Text
              numberOfLines={1}
              style={{ fontFamily: wuzyFonts.bold, fontSize: wuzyType.body, color: wuzyColors.white }}>
              {activeTicket.title}
            </Text>
            <View className="h-[5px] overflow-hidden rounded-full bg-white/10">
              <Animated.View className="h-full rounded-full bg-wuzy-yellow" style={barWidth} />
            </View>
            <Pressable
              onPress={() => handleShare(activeTicket)}
              accessibilityRole="button"
              className="items-center justify-center rounded-full active:opacity-80"
              style={{ height: wuzyLayout.control, backgroundColor: wuzyColors.yellow }}>
              <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body, color: wuzyColors.bg }}>
                Share event
              </Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
