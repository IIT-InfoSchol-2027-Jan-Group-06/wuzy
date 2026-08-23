import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import type { ChatMessage } from '@/constants/chat-data';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

type MessageRowProps = {
  item: ChatMessage;
  onPress?: () => void;
  showUnread?: boolean;
};

export function MessageRow({ item, onPress, showUnread = true }: MessageRowProps) {
  return (
    <TouchableOpacity
      className="h-[60px] flex-row items-center px-[30px] py-[10px]"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="h-10 w-10 rounded-full items-center justify-center" style={{ borderWidth: 1, borderColor: wuzyColors.yellow }}>
        <Image source={item.avatar} className="h-10 w-10 rounded-full" />
      </View>
      <View className="ml-3 flex-1">
        <Text
          className="text-[13px] leading-[19.5px] text-white"
          style={{ fontFamily: wuzyFonts.semibold }}>
          {item.name}
        </Text>
        <View className="flex-row items-center">
          <Text
            numberOfLines={1}
            className="flex-1 text-[13px] leading-[19.5px] text-white"
            style={{ fontFamily: wuzyFonts.semibold }}>
            {item.preview}
          </Text>
          <Text
            className="text-[14px] leading-[21px]"
            style={{ fontFamily: wuzyFonts.semibold, color: wuzyColors.gray }}>
            {item.time}
          </Text>
        </View>
      </View>
      {showUnread && item.unread && (
        <View className="ml-2 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: wuzyColors.yellow }} />
      )}
    </TouchableOpacity>
  );
}