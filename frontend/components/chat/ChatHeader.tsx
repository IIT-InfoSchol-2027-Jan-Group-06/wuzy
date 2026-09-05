import React from 'react';
import { Image, Text, View } from 'react-native';

import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyColors, wuzyFonts, wuzyLayout } from '@/constants/wuzy-theme';
import { useResponsive } from '@/hooks/useResponsive';

const AVATAR = 44;

type ChatHeaderProps = {
  name: string;
  avatar: number;
  status: string;
  onBack: () => void;
};

/** Thread header: back button, ringed avatar, name over status. Relies on Screen for padding. */
export function ChatHeader({ name, avatar, status, onBack }: ChatHeaderProps) {
  const { fontSize } = useResponsive();

  return (
    <View className="flex-row items-center" style={{ gap: wuzyLayout.itemGap }}>
      <GlassNavButton icon="arrow-back" onPress={onBack} />
      <View
        style={{
          width: AVATAR,
          height: AVATAR,
          borderRadius: AVATAR / 2,
          borderWidth: 1,
          borderColor: wuzyColors.yellowDim,
          padding: 2,
        }}>
        <Image source={avatar} style={{ width: '100%', height: '100%', borderRadius: AVATAR / 2 }} />
      </View>
      <View className="flex-1">
        <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.medium, fontSize: fontSize('body'), color: wuzyColors.white }}>
          {name}
        </Text>
        <Text style={{ fontFamily: wuzyFonts.body, fontSize: fontSize('caption'), color: wuzyColors.yellowSoft }}>{status}</Text>
      </View>
    </View>
  );
}
