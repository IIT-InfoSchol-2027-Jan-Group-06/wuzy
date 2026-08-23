import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { ReactNode } from 'react';

export interface GlassNavButtonProps {
  icon: ReactNode | keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  className?: string;
  size?: number;
}

export function GlassNavButton({
  icon,
  onPress,
  className = '',
  size,
}: GlassNavButtonProps) {
  const { width: screenWidth } = useWindowDimensions();
  const baseSize = size ?? Math.round((50 / 375) * screenWidth);
  const resolvedIconSize = Math.round(baseSize * 0.48);

  const isStringIcon = typeof icon === 'string';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`rounded-full overflow-hidden active:scale-95 ${className}`}
      style={{ width: baseSize, height: baseSize }}
    >
      <BlurView
        intensity={40}
        tint="dark"
        style={StyleSheet.absoluteFillObject}
      />
      <View style={StyleSheet.absoluteFillObject}>
        <View
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: 'rgba(84, 82, 56, 0.35)',
          }}
        />
        <View
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: 'rgba(244, 196, 0, 0.1)',
          }}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.03)', 'rgba(0,0,0,0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
          locations={[0, 0.5, 1]}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0.25)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View className="absolute inset-0 rounded-full border border-white/30" />
        <View className="absolute top-0 left-0 right-0 rounded-t-full border-t border-white/50" style={{ height: baseSize * 0.5 }} />
        <View className="absolute bottom-0 left-0 right-0 rounded-b-full border-b border-black/30" style={{ height: baseSize * 0.5 }} />
      </View>
      <View
        className="flex-1 items-center justify-center relative z-10"
      >
        {isStringIcon ? (
          <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={resolvedIconSize} color="#FFFFFF" />
        ) : (
          <>{icon}</>
        )}
      </View>
    </Pressable>
  );
}