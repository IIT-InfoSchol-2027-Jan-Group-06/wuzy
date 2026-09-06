import React from 'react';
import { Image, ImageSourcePropType, Pressable, Text, View } from 'react-native';

import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

const AVATAR = 48;

export interface MessageRowItem {
  id: string;
  userId?: string | number;
  name: string;
  preview: string;
  time: string;
  avatar: ImageSourcePropType;
  unread: boolean;
}

/** One thread in the chat list: ringed avatar, name over preview, time and unread dot on the right. Avatar and name open that person's profile; the rest opens the thread. */
export function MessageRow({ item, onPress, onUserPress }: { item: MessageRowItem; onPress?: () => void; onUserPress?: () => void }) {

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center active:opacity-70"
      style={{ gap: wuzyLayout.itemGap, paddingVertical: 4 }}>
      <Pressable onPress={onUserPress} disabled={!onUserPress} hitSlop={6}>
        <View
          style={{
            width: AVATAR,
            height: AVATAR,
            borderRadius: AVATAR / 2,
            borderWidth: 1,
            borderColor: wuzyColors.yellow,
            padding: 2,
          }}>
          <Image source={item.avatar} style={{ width: '100%', height: '100%', borderRadius: AVATAR / 2 }} />
        </View>
      </Pressable>
      <View className="flex-1">
        <Pressable onPress={onUserPress} disabled={!onUserPress} hitSlop={6}>
          <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body, color: wuzyColors.white }}>
            {item.name}
          </Text>
        </Pressable>
        <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.gray }}>
          {item.preview}
        </Text>
      </View>
      <View className="items-end" style={{ gap: 6 }}>
        <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.caption, color: wuzyColors.gray }}>{item.time}</Text>
        {item.unread && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: wuzyColors.yellow }} />}
      </View>
    </Pressable>
  );
}