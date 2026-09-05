import React from 'react';
import { Image, Text, View, useWindowDimensions } from 'react-native';
import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

type ChatHeaderProps = {
  name: string;
  avatar: number;
  status: string;
  onBack: () => void;
};

export function ChatHeader({ name, avatar, status, onBack }: ChatHeaderProps) {
  const { width: screenWidth } = useWindowDimensions();
  const scale = screenWidth / 375;

  const avatarSize = Math.round(42 * scale);
  const gap = Math.round(10 * scale);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap,
        paddingHorizontal: Math.round(20 * scale),
      }}>
      <GlassNavButton icon="arrow-back" onPress={onBack} />
      <View
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          borderWidth: Math.max(1, Math.round(1 * scale)),
          borderColor: 'rgba(255, 231, 131, 0.35)',
          padding: Math.round(2 * scale),
          marginLeft: Math.round(4 * scale),
        }}>
        <Image source={avatar} style={{ width: '100%', height: '100%', borderRadius: avatarSize / 2 }} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: Math.round(15 * scale),
            lineHeight: Math.round(22 * scale),
            color: wuzyColors.white,
            fontFamily: wuzyFonts.medium,
          }}>
          {name}
        </Text>
        <Text
          style={{
            fontSize: Math.round(12 * scale),
            lineHeight: Math.round(15 * scale),
            color: 'rgba(255, 231, 131, 0.8)',
            fontFamily: wuzyFonts.body,
          }}>
          {status}
        </Text>
      </View>
    </View>
  );
}
