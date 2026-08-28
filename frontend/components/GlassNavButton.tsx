import { Ionicons } from '@expo/vector-icons';
import { Pressable, View, useWindowDimensions } from 'react-native';
import type { ReactNode } from 'react';

import { GlassSurface } from '@/components/GlassSurface';

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
      <GlassSurface radius={baseSize / 2} />
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