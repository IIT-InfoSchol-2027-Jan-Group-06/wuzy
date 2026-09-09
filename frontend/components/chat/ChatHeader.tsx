import React from 'react';
import { Image, type ImageSourcePropType, Pressable, Text, View } from 'react-native';

import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

const AVATAR = 44;

type ChatHeaderProps = {
  name: string;
  avatar: ImageSourcePropType;
  status: string;
  onBack: () => void;
  onUserPress?: () => void;
};

/** Thread header: back button, ringed avatar, name over status. Tapping the avatar or name opens that person's profile. Relies on Screen for padding. */
export function ChatHeader({ name, avatar, status, onBack, onUserPress }: ChatHeaderProps) {

  return (
    <View className="flex-row items-center" style={{ gap: wuzyLayout.itemGap }}>
      <GlassNavButton icon="arrow-back" onPress={onBack} />
      <Pressable onPress={onUserPress} disabled={!onUserPress} hitSlop={6} className="flex-1 flex-row items-center" style={{ gap: wuzyLayout.itemGap }}>
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
          <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.body, color: wuzyColors.white }}>
            {name}
          </Text>
          <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.caption, color: wuzyColors.yellowSoft }}>{status}</Text>
        </View>
      </Pressable>
    </View>
  );
}
