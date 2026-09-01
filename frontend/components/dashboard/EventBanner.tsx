import { Image, Text, View, useWindowDimensions } from 'react-native';

import { EventBannerData } from '@/constants/dashboard-data';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

type EventBannerProps = {
  data: EventBannerData;
};

/** Hero card for the dashboard: event photo with tagline and title overlaid. */
export function EventBanner({ data }: EventBannerProps) {
  const { width: screenWidth } = useWindowDimensions();
  const height = Math.round(screenWidth * 0.56);
  const radius = Math.round(screenWidth * 0.045);
  const horizontalPad = Math.round(screenWidth * 0.06);
  const taglineSize = Math.round(screenWidth * 0.024);
  const titleSize = Math.round(screenWidth * 0.06);

  return (
    <View style={{ height, borderRadius: radius, overflow: 'hidden' }}>
      <Image source={data.image} className="absolute inset-0 h-full w-full" resizeMode="cover" />
      <View
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(10, 15, 23, 0.35)' }}
      />
      <View className="absolute bottom-0 left-0 right-0" style={{ paddingHorizontal: horizontalPad, paddingBottom: Math.round(screenWidth * 0.045) }}>
        <Text
          style={{
            color: wuzyColors.yellow,
            fontFamily: wuzyFonts.semibold,
            fontSize: taglineSize,
            letterSpacing: 1.5,
          }}>
          {data.tagline}
        </Text>
        <Text
          style={{
            color: wuzyColors.white,
            fontFamily: wuzyFonts.bold,
            fontSize: titleSize,
            marginTop: Math.round(screenWidth * 0.008),
          }}>
          {data.title}
        </Text>
      </View>
    </View>
  );
}
