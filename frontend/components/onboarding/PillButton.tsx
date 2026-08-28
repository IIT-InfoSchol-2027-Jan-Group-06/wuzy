import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { GlassSurface } from '@/components/GlassSurface';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

export interface PillButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'outline' | 'solid';
}

export function PillButton({ label, onPress, variant = 'filled' }: PillButtonProps) {
  const { width: screenWidth } = useWindowDimensions();
  const radius = Math.round(screenWidth * 0.056);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="active:scale-95"
      style={{
        width: Math.round(screenWidth * 0.66),
        height: Math.round(screenWidth * 0.125),
        borderRadius: radius,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: variant === 'solid' ? wuzyColors.yellow : 'transparent',
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor: wuzyColors.yellow,
      }}>
      {variant === 'filled' && (
        <>
          <GlassSurface radius={radius} />
          {/* darkens the glass to match the Figma pill contrast */}
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, { borderRadius: radius, backgroundColor: 'rgba(0, 0, 0, 0.4)' }]}
          />
        </>
      )}
      <Text
        style={{
          fontFamily: wuzyFonts.bold,
          fontSize: Math.round(screenWidth * 0.042),
          color: variant === 'filled' ? wuzyColors.white : variant === 'solid' ? '#000000' : wuzyColors.yellow,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}
