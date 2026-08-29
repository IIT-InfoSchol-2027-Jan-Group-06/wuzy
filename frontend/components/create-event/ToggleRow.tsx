import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

export interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/** Horizontal row: gold label left, custom switch with a yellow outline and glass knob. */
export function ToggleRow({ label, value, onValueChange }: ToggleRowProps) {
  const { width: screenWidth } = useWindowDimensions();

  const labelFontSize = Math.round(screenWidth * 0.04);
  const trackWidth = Math.round(screenWidth * 0.145);
  const trackHeight = Math.round(screenWidth * 0.085);
  const knobSize = Math.max(trackHeight - 6, 24);
  const travel = trackWidth - knobSize - 4;

  return (
    <View className="w-full flex-row items-center justify-between py-[8px]">
      <Text
        style={{
          fontFamily: wuzyFonts.semibold,
          fontSize: labelFontSize,
          color: wuzyColors.yellow,
        }}>
        {label}
      </Text>
      <Pressable
        onPress={() => onValueChange(!value)}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        style={{
          width: trackWidth,
          height: trackHeight,
          borderRadius: trackHeight / 2,
          borderWidth: 1,
          borderColor: wuzyColors.yellow,
          backgroundColor: value ? wuzyColors.yellow : wuzyColors.bg,
          padding: 2,
          justifyContent: 'center',
        }}>
        <View
          style={{
            width: knobSize,
            height: knobSize,
            borderRadius: knobSize / 2,
            transform: [{ translateX: value ? travel : 0 }],
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.4)',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
          }}>
          <LinearGradient
            colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      </Pressable>
    </View>
  );
}