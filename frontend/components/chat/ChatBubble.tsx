import React from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

type ChatBubbleProps = {
  text: string;
  outgoing: boolean;
};

export function ChatBubble({ text, outgoing }: ChatBubbleProps) {
  const { width: screenWidth } = useWindowDimensions();
  const scale = screenWidth / 375;

  const radius = Math.round(16 * scale);
  const nick = Math.round(2 * scale);

  return (
    <View
      style={{
        alignSelf: outgoing ? 'flex-end' : 'flex-start',
        maxWidth: Math.round(280 * scale),
        paddingVertical: Math.round(12 * scale),
        paddingHorizontal: Math.round(16 * scale),
        borderTopLeftRadius: outgoing ? radius : nick,
        borderTopRightRadius: outgoing ? nick : radius,
        borderBottomLeftRadius: radius,
        borderBottomRightRadius: radius,
        ...(outgoing
          ? {
              backgroundColor: '#C1AE5F',
              shadowColor: '#C1AE5F',
              shadowOpacity: 0.1,
              shadowRadius: 7.5,
              shadowOffset: { width: 0, height: 0 },
            }
          : {
              backgroundColor: 'rgba(84, 82, 56, 0.35)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }),
      }}>
      <Text
        style={{
          fontSize: Math.round(16 * scale),
          lineHeight: Math.round(24 * scale),
          color: outgoing ? '#000811' : wuzyColors.white,
          fontFamily: wuzyFonts.body,
        }}>
        {text}
      </Text>
    </View>
  );
}
