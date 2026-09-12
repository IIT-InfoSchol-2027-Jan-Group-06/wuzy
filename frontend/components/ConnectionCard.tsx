import { useEffect } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { GlassNavButton } from '@/components/GlassNavButton';
import { TagSection } from '@/components/TagSection';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import type { Connection } from '@/constants/connection-data';

const AVATAR = 56;

// The Wheel keeps a fixed 132 slot per card. The expanded card stretches taller and overlays its neighbours.
const COMPRESSED_HEIGHT = 132;
const EXPANDED_HEIGHT = 215;

interface ConnectionCardProps {
  connection: Connection;
  /** Taller with action buttons below the interests; overlays the wheel slot. */
  expanded?: boolean;
  onAvatarPress?: () => void;
  /** Opens the connection's profile; only wired when the card is expanded. */
  onProfilePress?: () => void;
}

/** Connection card: name on the left, avatar with online dot on the right, interest tags below. Tapping the avatar expands it. */
export function ConnectionCard({ connection, expanded = false, onAvatarPress, onProfilePress }: ConnectionCardProps) {
  const expandedSV = useSharedValue(false);

  useEffect(() => {
    expandedSV.value = expanded;
  }, [expanded, expandedSV]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(expandedSV.value ? EXPANDED_HEIGHT : COMPRESSED_HEIGHT, { duration: 250 }),
    // Both sides of the comparison are explicit: neighbours sit low, the expanded card sits clearly higher.
    zIndex: expandedSV.value ? 100 : 1,
    elevation: expandedSV.value ? 100 : 1,
  }));

  const avatar = (
    <Image source={connection.avatar} style={{ width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2 }} resizeMode="cover" />
  );

  const onlineDot = connection.online && (
    <View
      className="absolute bottom-0 right-0 rounded-full border-2"
      style={{ width: 14, height: 14, backgroundColor: wuzyColors.online, borderColor: wuzyColors.surface }}
    />
  );

  return (
    <Animated.View
      needsOffscreenAlphaCompositing={expanded}
      renderToHardwareTextureAndroid={expanded}
      style={[
        animatedStyle,
        {
          justifyContent: 'center',
          borderRadius: 24,
          padding: 16,
          backgroundColor: wuzyColors.surface,
          shadowColor: '#000000',
          shadowOpacity: 0.4,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 10 },
        },
      ]}>
      <View className="flex-row items-center justify-between" style={{ gap: wuzyLayout.itemGap }}>
        <View className="flex-1">
          <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body, color: wuzyColors.yellow }}>
            {connection.name}
          </Text>
        </View>
        {onAvatarPress ? (
          <Pressable
            onPress={onAvatarPress}
            accessibilityRole="button"
            accessibilityLabel={expanded ? `Collapse ${connection.name}` : `Expand ${connection.name}`}
            accessibilityState={{ expanded }}>
            {avatar}
            {onlineDot}
          </Pressable>
        ) : (
          <View>
            {avatar}
            {onlineDot}
          </View>
        )}
      </View>
      <View style={{ marginTop: wuzyLayout.itemGap }}>
        <TagSection tags={connection.tags} />
      </View>
      {expanded && (
        <View className="flex-row" style={{ gap: wuzyLayout.itemGap, marginTop: 25 }}>
          <GlassNavButton
            onPress={onProfilePress ?? (() => {})}
            style={{ flex: 1, height: wuzyLayout.control }}
            accessibilityLabel={`Go to ${connection.name}'s profile`}>
            <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.yellow }}>
              Go to profile
            </Text>
          </GlassNavButton>
          <GlassNavButton onPress={() => {}} style={{ flex: 1, height: wuzyLayout.control }}>
            <Text
              numberOfLines={2}
              style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.yellow, textAlign: 'center' }}>
              Refer to a{'\n'}friend
            </Text>
          </GlassNavButton>
        </View>
      )}
    </Animated.View>
  );
}