import { Image, ImageSourcePropType, Text, View } from 'react-native';

import { wuzyFonts } from '@/constants/wuzy-theme';

export interface UserRowProps {
  avatar: ImageSourcePropType;
  name: string;
  label?: string;
  timestamp?: string;
}

/** Compact user row: 48px avatar, gray label with white name inline, timestamp below. */
export function UserRow({ avatar, name, label, timestamp }: UserRowProps) {
  return (
    <View className="flex-row items-center gap-[13px]">
      <Image source={avatar} style={{ width: 48, height: 48, borderRadius: 24 }} resizeMode="cover" />
      <View>
        <Text style={{ fontFamily: wuzyFonts.medium, fontSize: 15, color: '#999999' }}>
          {label ? `${label}  ` : ''}
          <Text style={{ color: '#FFFFFF' }}>{name}</Text>
        </Text>
        {timestamp ? (
          <Text style={{ fontFamily: wuzyFonts.medium, fontSize: 12, color: '#858585' }}>
            {timestamp}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
