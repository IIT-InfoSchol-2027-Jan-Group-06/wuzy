import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image as SvgImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useRouter } from 'expo-router';

import { GlassNavButton } from '@/components/GlassNavButton';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { mockEvent } from '@/constants/event-data';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { apiBumpQuestProgress, apiGetQuests } from '@/lib/api';

const AVATAR = 36;
const AVATAR_OVERLAP = 12;
const ACTION_HEIGHT = wuzyLayout.control;

export default function EventDetailsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [isLiked, setIsLiked] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const e = mockEvent;
  // Explicit capped heights: Yoga narrows an aspectRatio box when maxHeight clamps it.
  const heroHeight = Math.min(Math.round(width * 0.95), 400);
  const mapHeight = Math.min(Math.round((width - 2 * wuzyLayout.side) * 0.6), 260);
  const description = showMore || e.description.length <= 180 ? e.description : `${e.description.slice(0, 180).trimEnd()}...`;

  const avatarStyle = (index: number) => ({
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    borderWidth: 2,
    borderColor: wuzyColors.bg,
    marginLeft: index === 0 ? 0 : -AVATAR_OVERLAP,
    zIndex: 10 - index,
  });

  // Buying a ticket is the "attend" action, so each purchase counts toward the task.
  const handleBuyTicket = async () => {
    try {
      const data = await apiGetQuests();
      const quest = data.quests.find((q) => q.name === 'Attend Live Events');
      if (quest) {
        await apiBumpQuestProgress(quest.id);
      }
    } catch {
      // Keeps the count unchanged; the bump did not go through.
    }
    router.push('/ticket');
  };

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
        <Image source={e.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(10,15,23,0.4)', 'rgba(10,15,23,0.8)', wuzyColors.bg]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View className="absolute flex-row items-end justify-between" style={{ bottom: 0, left: wuzyLayout.side, right: wuzyLayout.side, gap: wuzyLayout.itemGap }}>
          <Text
            className="flex-1 text-wuzy-yellow"
            style={{ fontFamily: wuzyFonts.display, fontSize: wuzyType.display, lineHeight: Math.round(wuzyType.display * 1.05) }}>
            {e.title}
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
          {e.description.length > 180 && (
            <Pressable onPress={() => setShowMore((v) => !v)} accessibilityRole="button">
              <Text className="text-wuzy-yellow" style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body }}>
                {showMore ? 'Show less' : 'Show more'}
              </Text>
            </Pressable>
          )}
        </View>

        <View className="flex-row items-start justify-between" style={{ gap: wuzyLayout.gap }}>
          <View className="flex-1" style={{ gap: wuzyLayout.itemGap }}>
            <View className="flex-row items-center">
              {e.attendees.slice(0, 3).map((attendee, index) => (
                <Image key={attendee.id} source={attendee.avatar} style={avatarStyle(index)} resizeMode="cover" />
              ))}
              {e.attendees.length > 3 && (
                <View className="items-center justify-center" style={[avatarStyle(3), { backgroundColor: wuzyColors.yellowDim }]}>
                  <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.caption, color: wuzyColors.yellow }}>
                    +{e.attendees.length - 3}
                  </Text>
                </View>
              )}
            </View>
            <View>
              <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.yellow }}>{e.venue}</Text>
              <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.yellowSoft }}>{e.location}</Text>
            </View>
          </View>
          <View className="items-end">
            <Text style={{ fontFamily: wuzyFonts.display, fontSize: wuzyType.title, color: wuzyColors.white }}>{e.date}</Text>
            <Text style={{ fontFamily: wuzyFonts.display, fontSize: wuzyType.title, color: wuzyColors.white }}>{e.time}</Text>
          </View>
        </View>

        <View style={{ gap: wuzyLayout.itemGap }}>
          <Text className="text-wuzy-yellow" style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.section }}>
            Location
          </Text>
          <View style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: wuzyColors.glassBorder }}>
            <Image source={e.mapImage} style={{ width: '100%', height: mapHeight }} resizeMode="cover" />
          </View>
        </View>

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
            <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body, color: wuzyColors.bg }}>Buy ticket</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
