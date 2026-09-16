import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { wuzyColors } from '@/constants/wuzy-theme';

interface LiquidGlassProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Translucency of the tint, 0-1. */
  tint?: number;
  /** Tint and hairline color, default wuzy yellow. */
  tintColor?: string;
}

/** TintColor as rgba at the given alpha, for the frosted overlay. */
function toRgba(color: string, alpha: number): string {
  const h = color.match(/^#([0-9a-f]{6})$/i);
  if (h) {
    const n = parseInt(h[1], 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (m) return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${alpha})`;
  return color;
}

/** Frosted "liquid glass" surface: blur base, translucent tint, top shine, hairline border. Defaults to wuzy yellow; pass a tintColor for a different tint. */
export function LiquidGlass({ children, style, tint = 0.25, tintColor = wuzyColors.yellow }: LiquidGlassProps) {
  return (
    <View className="overflow-hidden rounded-full" style={[{ borderWidth: 1, borderColor: tintColor }, style]}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: toRgba(tintColor, tint) }]} />
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