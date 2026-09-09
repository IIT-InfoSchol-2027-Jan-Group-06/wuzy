import { useCallback, useEffect, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, Pressable, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';

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

  const handleShare = async () => {
    try {
      const shareResult = await Share.share({
        message: `${activeTicket.title}, ${activeTicket.date}. Join me on Wuzy!`,
      });
      if (shareResult.action !== Share.dismissedAction && taskId) {
        try {
          await apiBumpTaskProgress(Number(taskId));
          await refreshShare();
        } catch {
          // Keep the count unchanged; the bump did not go through.
        }
      }
    } catch {
      // Share sheet dismissed or not supported; nothing to count.
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
              <Pressable onPress={handleShare} accessibilityRole="button" className="active:opacity-80">
                <TicketCard ticket={item} width={cardWidth} />
              </Pressable>
            )}
          />
        </View>

        {shareTarget > 0 && (
          <View className="mx-[16px] mb-[8px] gap-[12px] rounded-2xl border border-white/10 bg-[#0B0E14]/70 p-4">
            <View className="flex-row items-center justify-between">
              <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.white }}>
                Events you get
              </Text>
              <Text style={{ fontFamily: wuzyFonts.bold, fontSize: wuzyType.small, color: wuzyColors.yellow }}>
                {shareCount} / {shareTarget}
              </Text>
            </View>
            <View className="h-[5px] overflow-hidden rounded-full bg-white/10">
              <View
                className="h-full rounded-full bg-wuzy-yellow"
                style={{ width: `${Math.min(100, Math.round((shareCount / Math.max(shareTarget, 1)) * 100))}%` }}
              />
            </View>
            <Pressable
              onPress={handleShare}
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
