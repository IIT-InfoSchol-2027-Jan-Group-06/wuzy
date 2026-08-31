import React from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { wuzyFonts } from '@/constants/wuzy-theme';

export function DateChip({ label }: { label: string }) {
  const { width: screenWidth } = useWindowDimensions();
  const scale = screenWidth / 375;

  return (
    <View
      style={{
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 19, 103, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 9999,
        paddingVertical: Math.round(9 * scale),
        paddingHorizontal: Math.round(13 * scale),
      }}>
      <Text
        style={{
          fontSize: Math.round(12 * scale),
          lineHeight: Math.round(15 * scale),
          color: 'rgba(255, 255, 255, 0.6)',
          fontFamily: wuzyFonts.medium,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}>
        {label}
      </Text>
    </View>
  );
}
