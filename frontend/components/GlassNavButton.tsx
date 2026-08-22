import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { ReactNode } from 'react';

export interface GlassNavButtonProps {
  icon: ReactNode | keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  className?: string;
}

export function GlassNavButton({
  icon,
  onPress,
  className = '',
}: GlassNavButtonProps) {
  const { width: screenWidth } = useWindowDimensions();
  const baseSize = Math.round((50 / 375) * screenWidth);
  const resolvedIconSize = Math.round(baseSize * 0.48);

  const isStringIcon = typeof icon === 'string';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`rounded-full overflow-hidden border border-white/20 active:scale-95 ${className}`}
      style={{ width: baseSize, height: baseSize }}
    >
      <BlurView
        intensity={25}
        tint="dark"
        style={StyleSheet.absoluteFillObject}
      />
      <View
        className="flex-1 items-center justify-center"
        style={{
          backgroundColor: 'rgba(84, 82, 56, 0.4)',
        }}
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