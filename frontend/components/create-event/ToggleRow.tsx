import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { wuzyColors, wuzyFonts, wuzyType } from '@/constants/wuzy-theme';

export interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/** Horizontal row: gold label left, custom switch with a yellow outline and glass knob. */
export function ToggleRow({ label, value, onValueChange }: ToggleRowProps) {
  // Material 3 switch geometry. The track box includes its 1 border and 2 padding on each side.
  const trackWidth = 52;
  const trackHeight = 32;
  const knobSize = 26;
  const travel = trackWidth - knobSize - 6;

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(value ? travel : 0, { duration: 250 }) }],
  }));

  return (
    <View className="w-full flex-row items-center justify-between py-[8px]">
      <Text
        style={{
          fontFamily: wuzyFonts.semibold,
          fontSize: wuzyType.body,
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
        <Animated.View
          style={[
            {
              width: knobSize,
              height: knobSize,
              borderRadius: knobSize / 2,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.4)',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
            },
            knobStyle,
          ]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}
