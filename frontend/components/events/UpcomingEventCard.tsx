import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

import type { UpcomingEvent } from '@/constants/event-data';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

const HEIGHT = 120;
const AVATAR = 28;
const BADGE = 64;

/** Wide banner card for the Up coming list: title and host on the left, date badge on the right. */
export function UpcomingEventCard({ event, onPress }: { event: UpcomingEvent; onPress?: () => void }) {

  return (
    <Pressable
      onPress={onPress}
      className="active:opacity-80"
      style={{ height: HEIGHT, borderRadius: 24, backgroundColor: wuzyColors.surface, overflow: 'hidden' }}>
      <Image source={event.imageUri} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} contentFit="cover" transition={250} />
      <LinearGradient
        colors={['rgba(10,15,23,0.9)', 'rgba(10,15,23,0.3)', 'rgba(10,15,23,0.9)']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <View className="flex-1 flex-row items-center" style={{ padding: 16, gap: wuzyLayout.itemGap }}>
        <View className="flex-1 justify-end" style={{ gap: 6 }}>
          <Text
            numberOfLines={2}
            style={{ fontFamily: wuzyFonts.bold, fontSize: wuzyType.body, lineHeight: Math.round(wuzyType.body * 1.3), color: wuzyColors.white }}>
            {event.title}
          </Text>
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <Image
              source={event.hostAvatar}
              style={{ width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2, borderWidth: 1.5, borderColor: wuzyColors.yellow }}
              contentFit="cover"
            />
            <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.white }}>
              {event.hostName}
            </Text>
          </View>
        </View>

        <View
          className="items-center justify-center"
          style={{ width: BADGE, height: BADGE, borderRadius: 16, backgroundColor: wuzyColors.white }}>
          <Text style={{ fontFamily: wuzyFonts.bold, fontSize: wuzyType.section, lineHeight: Math.round(wuzyType.section * 1.05), includeFontPadding: false, color: wuzyColors.bg }}>
            {event.dateDay}
          </Text>
          <Text
            className="uppercase"
            style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.caption, color: wuzyColors.bg, letterSpacing: 1 }}>
            {event.dateMonth}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
