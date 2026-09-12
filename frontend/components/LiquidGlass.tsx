import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { wuzyColors } from '@/constants/wuzy-theme';

interface LiquidGlassProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Translucency of the yellow tint, 0-1. */
  tint?: number;
}

/** Frosted yellow "liquid glass" surface: blur base, translucent yellow tint, top shine, hairline border. The Connect toggle's look. */
export function LiquidGlass({ children, style, tint = 0.25 }: LiquidGlassProps) {
  return (
    <View className="overflow-hidden rounded-full" style={[{ borderWidth: 1, borderColor: wuzyColors.yellow }, style]}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(255, 231, 131, ${tint})` }]} />
      <LinearGradient
        colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0, 1]}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '60%' }}
      />
      {children}
    </View>
  );
}