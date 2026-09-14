import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image as SvgImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { GlassNavButton } from '@/components/GlassNavButton';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TagSection } from '@/components/TagSection';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import {
  apiBumpQuestProgress,
  apiGetEvent,
  apiGetQuests,
  apiGetRecommendedEvents,
  assetUrl,
  type ApiRecommendedEvent,
} from '@/lib/api';

const HOST_AVATAR = 36;
const ACTION_HEIGHT = wuzyLayout.control;

export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { width } = useWindowDimensions();
  const [event, setEvent] = useState<ApiRecommendedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // Awards pushes /event-details without an id: fall back to the top pick.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const found = id
          ? await apiGetEvent(Number(id))
          : (await apiGetRecommendedEvents())[0];
        if (active) setEvent(found ?? null);
      } catch {
        if (active) setEvent(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  // Explicit capped heights: Yoga narrows an aspectRatio box when maxHeight clamps it.
  const heroHeight = Math.min(Math.round(width * 0.95), 400);

  const handleBuyTicket = async () => {
    if (!event) return;
    try {
      const data = await apiGetQuests();
      const quest = data.quests.find((q) => q.name === 'Attend Live Events');
      if (quest) {
        await apiBumpQuestProgress(quest.id);
      }
    } catch {
      // Keeps the count unchanged; the bump did not go through.
    }
    router.push({ pathname: '/ticket', params: { id: String(event.id) } });
  };

  if (loading) {
    return (
      <Screen>
        <ScreenHeader title="" />
        <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.section, color: wuzyColors.yellow }}>
          Loading…
        </Text>
      </Screen>
    );
  }

  if (!event) {
    return (
      <Screen>
        <ScreenHeader title="" />
        <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.body, color: wuzyColors.gray }}>
          This event is no longer available.
        </Text>
      </Screen>
    );
  }

  const text = event.description ?? '';
  const description = showMore || text.length <= 180 ? text : `${text.slice(0, 180).trimEnd()}...`;

  const start = new Date(event.start_time);
  const date = start
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    .toUpperCase();
  const time = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const hostName = event.host_name ?? 'Host';

  return (
    <Screen
      scroll
      padded={false}
      style={{ paddingTop: 0 }}
      overlay={
        // Floats over the hero. box-none so the hero underneath still scrolls.
        <View pointerEvents="box-none" className="absolute left-0 right-0" style={{ top: wuzyLayout.top, paddingHorizontal: wuzyLayout.side }}>
          <ScreenHeader title="" right={<GlassNavButton icon="share-outline" accessibilityLabel="Share" onPress={() => {}} />} />
        </View>
      }>
      <View style={{ height: heroHeight }}>
        <Image source={{ uri: assetUrl(event.image_url ?? '') }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(10,15,23,0.4)', 'rgba(10,15,23,0.8)', wuzyColors.bg]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View className="absolute flex-row items-end justify-between" style={{ bottom: 0, left: wuzyLayout.side, right: wuzyLayout.side, gap: wuzyLayout.itemGap }}>
          <Text
            className="flex-1 text-wuzy-yellow"
            style={{ fontFamily: wuzyFonts.display, fontSize: wuzyType.display, lineHeight: Math.round(wuzyType.display * 1.05) }}>
            {event.title}
          </Text>
          <GlassNavButton
            icon={isLiked ? 'heart' : 'heart-outline'}
            accessibilityLabel="Like"
            onPress={() => setIsLiked((v) => !v)}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: wuzyLayout.side, paddingTop: wuzyLayout.gap, gap: wuzyLayout.gap }}>
        <View style={{ gap: wuzyLayout.itemGap }}>
          <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.body, lineHeight: Math.round(wuzyType.body * 1.5), color: wuzyColors.white }}>
            {description}
          </Text>
          {text.length > 180 && (
            <Pressable onPress={() => setShowMore((v) => !v)} accessibilityRole="button">
              <Text className="text-wuzy-yellow" style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body }}>
                {showMore ? 'Show less' : 'Show more'}
              </Text>
            </Pressable>
          )}
        </View>

        <View className="flex-row items-start justify-between" style={{ gap: wuzyLayout.gap }}>
          <View className="flex-1" style={{ gap: wuzyLayout.itemGap }}>
            <View className="flex-row items-center" style={{ gap: wuzyLayout.itemGap }}>
              <Image source={{ uri: assetUrl(event.host_avatar_url ?? '') }} style={{ width: HOST_AVATAR, height: HOST_AVATAR, borderRadius: HOST_AVATAR / 2 }} resizeMode="cover" />
              <View>
                <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.yellow }}>{hostName}</Text>
                <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.yellowSoft }}>{event.venue}</Text>
              </View>
            </View>
            <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.yellowSoft }}>{event.location}</Text>
          </View>
          <View className="items-end">
            <Text style={{ fontFamily: wuzyFonts.display, fontSize: wuzyType.title, color: wuzyColors.white }}>{date}</Text>
            <Text style={{ fontFamily: wuzyFonts.display, fontSize: wuzyType.title, color: wuzyColors.white }}>{time}</Text>
          </View>
        </View>

        {event.tags.length > 0 && <TagSection tags={event.tags} />}

        <View className="flex-row items-center" style={{ gap: wuzyLayout.itemGap }}>
          <Pressable
            onPress={() => {}}
            accessibilityRole="button"
            accessibilityLabel="Gift a ticket"
            className="items-center justify-center rounded-full active:opacity-80"
            style={{ width: Math.round(ACTION_HEIGHT * 1.2), height: ACTION_HEIGHT, backgroundColor: wuzyColors.yellowDim }}>
            <SvgImage source={require('@/assets/icons/gift.svg')} style={{ width: 28, height: 28 }} contentFit="contain" />
          </Pressable>
          <Pressable
            onPress={handleBuyTicket}
            accessibilityRole="button"
            className="flex-1 items-center justify-center rounded-full active:opacity-80"
            style={{ height: ACTION_HEIGHT, backgroundColor: wuzyColors.yellow }}>
            <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body, color: wuzyColors.bg }}>
              Buy ticket · {event.price ?? 'Free'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}