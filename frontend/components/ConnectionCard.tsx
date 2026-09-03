import { Image, Text, View, useWindowDimensions } from 'react-native';

import { TagSection } from '@/components/TagSection';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';
import type { Connection } from '@/constants/connection-data';

/** Connection card: name over username on the left, avatar with online dot on the right, interest tags below. Fills its parent's height. */
export function ConnectionCard({ connection }: { connection: Connection }) {
  const { width: screenWidth } = useWindowDimensions();
  const bodySize = Math.round(screenWidth * 0.037);
  const smallSize = Math.round(screenWidth * 0.03);

  return (
    <View
      className="flex-1 justify-center rounded-[24px] p-[12px]"
      style={{
        backgroundColor: wuzyColors.surface,
        shadowColor: '#000000',
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
      }}>
      <View className="flex-row items-center justify-between gap-[10px]">
        <View className="flex-1">
          <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.semibold, fontSize: bodySize, color: wuzyColors.yellow }}>
            {connection.name}
          </Text>
          <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.body, fontSize: smallSize, color: wuzyColors.white }}>
            {connection.username}
          </Text>
        </View>
        <View>
          <Image source={connection.avatar} style={{ width: 40, height: 40, borderRadius: 20 }} resizeMode="cover" />
          {connection.online && (
            <View
              className="absolute -bottom-0.5 -right-0.5 rounded-full border-2"
              style={{ width: 12, height: 12, backgroundColor: wuzyColors.online, borderColor: wuzyColors.surface }}
            />
          )}
        </View>
      </View>
      <TagSection
        tags={connection.tags}
        containerStyle={{ paddingHorizontal: 0, marginTop: 4 }}
        contentContainerStyle={{ gap: 6, paddingBottom: 0 }}
        tagStyle={{ backgroundColor: wuzyColors.yellowDim, borderWidth: 0, paddingHorizontal: 10, paddingVertical: 4 }}
        textStyle={{ fontFamily: wuzyFonts.medium, fontSize: smallSize, color: '#CDC6B2' }}
      />
    </View>
  );
}
