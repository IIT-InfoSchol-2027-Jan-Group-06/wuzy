import { ReactNode } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';

type CardShellProps = {
  width?: number;
  height?: number;
  radius?: number;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

export function CardShell({
  width = 300,
  height = 295,
  radius = 31,
  onPress,
  disabled = false,
  style,
  children,
}: CardShellProps) {
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