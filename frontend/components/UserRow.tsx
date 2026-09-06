import { Image, ImageSourcePropType, Text, View } from 'react-native';

import { wuzyColors, wuzyFonts, wuzyLayout } from '@/constants/wuzy-theme';
import { useResponsive } from '@/hooks/useResponsive';

export interface UserRowProps {
  avatar: ImageSourcePropType;
  name: string;
  label?: string;
  timestamp?: string;
}

/** Compact user row: 48px avatar, gray label with white name inline, timestamp below. */
export function UserRow({ avatar, name, label, timestamp }: UserRowProps) {
  const { fontSize } = useResponsive();
  return (
    <View className="flex-row items-center" style={{ gap: wuzyLayout.itemGap }}>
      <Image source={avatar} style={{ width: 48, height: 48, borderRadius: 24 }} resizeMode="cover" />
      <View className="flex-1">
        <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.medium, fontSize: fontSize('body'), color: wuzyColors.gray }}>
          {label ? `${label}  ` : ''}
          <Text style={{ color: wuzyColors.white }}>{name}</Text>
        </Text>
        {timestamp ? (
          <Text style={{ fontFamily: wuzyFonts.medium, fontSize: fontSize('small'), color: wuzyColors.gray }}>
            {timestamp}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
