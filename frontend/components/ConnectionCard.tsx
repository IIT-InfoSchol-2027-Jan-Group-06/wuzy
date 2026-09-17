import { type ReactNode } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { GlassPillButton } from '@/components/GlassPillButton';
import { TagSection } from '@/components/TagSection';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import type { Connection } from '@/constants/connection-data';

const AVATAR = 56;

// The wheel keeps a fixed 132 slot per card; the popup shows the same card taller.
const COMPRESSED_HEIGHT = 132;
const EXPANDED_HEIGHT = 240;

interface ConnectionCardProps {
  connection: Connection;
  /** Renders the action row below the tags; only the popup sets this. */
  expanded?: boolean;
  /** Tap anywhere on the collapsed card surface to open it. */
  onPress?: () => void;
  /** Avatar tap while open; closes the popup. */
  onAvatarPress?: () => void;
  /** Opens the connection's profile; only wired when the card is open. */
  onProfilePress?: () => void;
  /** Wired to the popup card's "Refer to a friend" button. */
  onReferPress?: () => void;
  /** Rendered inside the open card instead of the action buttons. */
  expandedContent?: ReactNode;
}

/** Connection card: name on the left, avatar with online dot on the right, interest tags below. Tapping the card surface opens it in the centered popup owned by `ConnectionList`; the card itself never grows in the wheel. */
export function ConnectionCard({
  connection,
  expanded = false,
  onPress,
  onAvatarPress,
  onProfilePress,
  onReferPress,
  expandedContent,
}: ConnectionCardProps) {
  const avatar = (
    <Image source={connection.avatar} style={{ width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2 }} resizeMode="cover" />
  );

  const onlineDot = connection.online && (
    <View
      className="absolute bottom-0 right-0 rounded-full border-2"
      style={{ width: 14, height: 14, backgroundColor: wuzyColors.online, borderColor: wuzyColors.surface }}
    />
  );

  const cardContent = (
    <>
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
            accessibilityLabel={`Close ${connection.name}`}>
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
      {expanded && (expandedContent ?? (
        <View className="flex-row" style={{ gap: wuzyLayout.itemGap, marginTop: 35 }}>
          <GlassPillButton
            label="Go to profile"
            onPress={onProfilePress ?? (() => {})}
            style={{ flex: 1, maxWidth: 160 }}
            bold={false}
            accessibilityLabel={`Go to ${connection.name}'s profile`}
          />
          <GlassPillButton
            label={'Refer to a\nfriend'}
            onPress={onReferPress ?? (() => {})}
            numberOfLines={2}
            style={{ flex: 1, maxWidth: 160 }}
            bold={false}
            accessibilityLabel={`Refer ${connection.name} to a friend`}
          />
        </View>
      ))}
    </>
  );

  const surfaceStyle = {
    height: expanded ? EXPANDED_HEIGHT : COMPRESSED_HEIGHT,
    borderRadius: 24,
    backgroundColor: wuzyColors.surface,
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
  };

  if (!expanded) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Open ${connection.name}`}
        style={surfaceStyle}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>{cardContent}</View>
      </Pressable>
    );
  }

  return (
    <View style={surfaceStyle}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>{cardContent}</View>
    </View>
  );
}