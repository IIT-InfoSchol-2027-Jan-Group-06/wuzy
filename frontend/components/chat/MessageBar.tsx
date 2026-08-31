import React from 'react';
import { TextInput, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

export function MessageBar() {
  const { width: screenWidth } = useWindowDimensions();
  const scale = screenWidth / 375;

  const iconSize = Math.round(20 * scale);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: Math.round(12 * scale),
        height: Math.round(55 * scale),
        marginHorizontal: Math.round(20 * scale),
        paddingHorizontal: Math.round(18 * scale),
        backgroundColor: '#3B3A2D',
        borderRadius: 9999,
      }}>
      <Ionicons name="happy-outline" size={iconSize} color={wuzyColors.white} />
      <TextInput
        placeholder="Message"
        placeholderTextColor={wuzyColors.white}
        style={{
          flex: 1,
          minWidth: 0,
          alignSelf: 'stretch',
          textAlignVertical: 'center',
          fontSize: Math.round(15 * scale),
          color: wuzyColors.white,
          fontFamily: wuzyFonts.bold,
          letterSpacing: 0.15,
          paddingVertical: 0,
        }}
      />
      <Ionicons name="attach-outline" size={iconSize} color={wuzyColors.white} />
      <Ionicons name="mic-outline" size={iconSize} color={wuzyColors.white} />
    </View>
  );
}
