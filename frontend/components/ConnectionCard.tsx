import { Image, Text, View } from 'react-native';

import { TagSection } from '@/components/TagSection';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import type { Connection } from '@/constants/connection-data';

const AVATAR = 56;

/** Connection card: name over username on the left, avatar with online dot on the right, interest tags below. Fills its parent's height. */
export function ConnectionCard({ connection }: { connection: Connection }) {

  return (
    <View
      className="flex-1 justify-center rounded-[24px] p-[16px]"
      style={{
        backgroundColor: wuzyColors.surface,
        shadowColor: '#000000',
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
      }}>
      <View className="flex-row items-center justify-between" style={{ gap: wuzyLayout.itemGap }}>
        <View className="flex-1">
          <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body, color: wuzyColors.yellow }}>
            {connection.name}
          </Text>
          <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.white }}>
            {connection.username}
          </Text>
        </View>
        <View>
          <Image source={connection.avatar} style={{ width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2 }} resizeMode="cover" />
          {connection.online && (
            <View
              className="absolute bottom-0 right-0 rounded-full border-2"
              style={{ width: 14, height: 14, backgroundColor: wuzyColors.online, borderColor: wuzyColors.surface }}
            />
          )}
        </View>
      </View>
      <View style={{ marginTop: wuzyLayout.itemGap }}>
        <TagSection tags={connection.tags} />
      </View>
    </View>
  );
}
