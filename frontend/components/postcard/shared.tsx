import { ReactNode } from 'react';
import { Image, ImageSourcePropType, Pressable, StyleProp, View, ViewStyle } from 'react-native';

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
  radius = 24,
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
