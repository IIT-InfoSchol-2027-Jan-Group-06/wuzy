import { ReactNode } from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

/**
 * Shared building blocks used by both the post card and the event card.
 */

/** Circular avatar with an optional ring color. */
export function Avatar({
  source,
  size = 35,
  borderColor = 'white',
  borderWidth = 1,
  style,
}: {
  source: ImageSourcePropType;
  size?: number;
  borderColor?: string;
  borderWidth?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      className="overflow-hidden rounded-full"
      style={[{ width: size, height: size, borderWidth, borderColor }, style]}>
      <Image source={source} className="h-full w-full" resizeMode="cover" />
    </View>
  );
}

/** Rounded container that handles press feedback and clipping. */
export function CardShell({
  width = 300,
  height = 295,
  radius = 31,
  onPress,
  disabled = false,
  style,
  children,
}: {
  width?: number;
  height?: number;
  radius?: number;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const outerStyle = [{ width, height, borderRadius: radius }, style];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className="relative overflow-hidden bg-wuzy-bg"
        style={({ pressed }) => [
          outerStyle,
          pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        ]}>
        {children}
      </Pressable>
    );
  }

  return (
    <View className="relative overflow-hidden bg-wuzy-bg" style={outerStyle}>
      {children}
    </View>
  );
}

/** Bold, single-line title used at the bottom of event cards. */
export function EventTitle({
  title,
  size = 15,
  color = wuzyColors.white,
  numberOfLines = 1,
  style,
}: {
  title: string;
  size?: number;
  color?: string;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      numberOfLines={numberOfLines}
      className="flex-1"
      style={[{ fontFamily: wuzyFonts.bold, fontSize: size, color }, style]}>
      {title}
    </Text>
  );
}