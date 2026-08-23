import React from 'react';
import { Image, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import type { ChatMessage } from '@/constants/chat-data';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

type MessageRowProps = {
  item: ChatMessage;
  onPress?: () => void;
  showUnread?: boolean;
};

export function MessageRow({ item, onPress, showUnread = true }: MessageRowProps) {
  const { width: screenWidth } = useWindowDimensions();
  const scale = screenWidth / 375;

  const avatarSize = Math.round(40 * scale);
  const horizontalPadding = Math.round(30 * scale);  // Figma: 30px
  const verticalPadding = Math.round(10 * scale);
  const gap = Math.round(12 * scale);
  const nameSize = Math.round(13 * scale);
  const previewSize = Math.round(13 * scale);
  const timeSize = Math.round(14 * scale);
  const unreadDotSize = Math.round(10 * scale);
  const borderWidth = Math.max(1, Math.round(1 * scale));
  const unreadDotRightOffset = Math.round(19 * scale); // Figma: 19px from row right edge

  return (
    <TouchableOpacity
      style={{
        height: Math.round(60 * scale),
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: horizontalPadding,
        paddingVertical: verticalPadding,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          borderWidth,
          borderColor: wuzyColors.yellow,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image
          source={item.avatar}
          style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
        />
      </View>
      <View style={{ marginLeft: gap, flex: 1 }}>
        <Text
          style={{
            fontSize: nameSize,
            lineHeight: Math.round(nameSize * 1.5),
            color: wuzyColors.white,
            fontFamily: wuzyFonts.semibold,
          }}>
          {item.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: previewSize,
              lineHeight: Math.round(previewSize * 1.5),
              color: wuzyColors.white,
              fontFamily: wuzyFonts.semibold,
            }}>
            {item.preview}
          </Text>
          <Text
            style={{
              fontSize: timeSize,
              lineHeight: Math.round(timeSize * 1.5),
              color: wuzyColors.gray,
              fontFamily: wuzyFonts.semibold,
            }}>
            {item.time}
          </Text>
        </View>
      </View>
      {showUnread && item.unread && (
        <View
          style={{
            position: 'absolute',
            right: Math.round(19 * scale), // Figma: 19px from row right edge
            top: '50%',
            marginTop: -unreadDotSize / 2,
            width: unreadDotSize,
            height: unreadDotSize,
            borderRadius: unreadDotSize / 2,
            backgroundColor: wuzyColors.yellow,
          }}
        />
      )}
    </TouchableOpacity>
  );
}