import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { wuzyColors } from '@/constants/wuzy-theme';
import { useResponsive } from '@/hooks/useResponsive';

export interface GlassNavButtonProps {
  icon?: ReactNode | keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  className?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  /** Replaces the icon. Pair with a width/height in style for a pill. */
  children?: ReactNode;
  accessibilityLabel?: string;
}

export function GlassNavButton({
  icon,
  onPress,
  className = '',
  size,
  style,
  children,
  accessibilityLabel,
}: GlassNavButtonProps) {
  const { screenWidth } = useResponsive();
  const baseSize = size ?? Math.round((50 / 375) * screenWidth);
  const resolvedIconSize = Math.round(baseSize * 0.48);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={`rounded-full overflow-hidden active:scale-95 ${className}`}
      style={[{ width: baseSize, height: baseSize }, style]}
    >
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={StyleSheet.absoluteFill}>
        {/* ponytail: Android BlurView only blurs a BlurTargetView it sits outside of, which inline buttons cannot do. A frosted fill stands in. */}
        {Platform.OS === 'android' && (
          <View className="absolute inset-0 rounded-full" style={{ backgroundColor: wuzyColors.surface, opacity: 0.85 }} />
        )}
        <View className="absolute inset-0 rounded-full" style={{ backgroundColor: wuzyColors.glassFill }} />
        <View className="absolute inset-0 rounded-full" style={{ backgroundColor: 'rgba(244, 196, 0, 0.1)' }} />
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.03)', 'rgba(0,0,0,0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          locations={[0, 0.5, 1]}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0.25)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View className="absolute inset-0 rounded-full border border-white/30" />
        <View className="absolute top-0 left-0 right-0 rounded-t-full border-t border-white/50" style={{ height: baseSize * 0.5 }} />
        <View className="absolute bottom-0 left-0 right-0 rounded-b-full border-b border-black/30" style={{ height: baseSize * 0.5 }} />
      </View>
      <View className="flex-1 items-center justify-center relative z-10">
        {children ??
          (typeof icon === 'string' ? (
            <Ionicons
              name={icon as keyof typeof Ionicons.glyphMap}
              size={resolvedIconSize}
              color="#FFFFFF"
              // Android pads icon fonts by default, which pushes the glyph off centre.
              style={{ includeFontPadding: false, textAlignVertical: 'center' }}
            />
          ) : (
            icon
          ))}
      </View>
    </Pressable>
  );
}
