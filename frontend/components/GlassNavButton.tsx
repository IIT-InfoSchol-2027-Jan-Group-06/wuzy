import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { wuzyColors, wuzyFonts, wuzyType } from '@/constants/wuzy-theme';

export interface GlassNavButtonProps {
  icon?: ReactNode | keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  className?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  /** Replaces the icon. Pair with a width/height in style for a pill. */
  children?: ReactNode;
  accessibilityLabel?: string;
  /** Tint layer color, default the frosted yellow (e.g. white for a neutral pill). */
  tintColor?: string;
  /** Unread count shown as a yellow pill at the top right; hidden when 0. */
  badge?: number;
}

export function GlassNavButton({
  icon,
  onPress,
  className = '',
  size,
  style,
  children,
  accessibilityLabel,
  tintColor = 'rgba(244, 196, 0, 0.1)',
  badge = 0,
}: GlassNavButtonProps) {
  const { width: screenWidth } = useWindowDimensions();
  const baseSize = size ?? Math.round((50 / 375) * screenWidth);
  const resolvedIconSize = Math.round(baseSize * 0.48);
  const badgeSize = Math.round(baseSize * 0.34);
  // Inset so the round badge stays inside the clipped circle.
  const badgeInset = Math.round(baseSize * 0.12);

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
        <View className="absolute inset-0 rounded-full" style={{ backgroundColor: tintColor }} />
        <View className="absolute inset-0 rounded-full border border-white/30" />
        <View className="absolute top-0 left-0 right-0 rounded-t-full border-t border-white/50" style={{ height: '50%' }} />
        <View className="absolute bottom-0 left-0 right-0 rounded-b-full border-b border-black/30" style={{ height: '50%' }} />
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
      {badge > 0 && (
        <View
          style={{
            position: 'absolute',
            top: badgeInset,
            right: badgeInset,
            minWidth: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            paddingHorizontal: 4,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: wuzyColors.yellow,
            zIndex: 11,
          }}>
          <Text style={{ fontFamily: wuzyFonts.bold, fontSize: wuzyType.caption, color: wuzyColors.bg }}>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
