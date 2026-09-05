import { Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ViewStyle, TextStyle } from 'react-native';

export interface StatusBadgeProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  textColor?: string;
  bgColor?: string;
  borderColor?: string;
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function StatusBadge({
  label,
  icon = 'flame',
  iconColor = '#F3D5E0',
  textColor = '#F3D5E0',
  bgColor = 'rgba(61, 51, 58, 0.8)',
  borderColor = 'rgba(140, 98, 114, 0.4)',
  className = '',
  style,
  textStyle,
}: StatusBadgeProps) {
  const { width: screenWidth } = useWindowDimensions();
  const defaultIconSize = Math.round(screenWidth * 0.03);
  const defaultFontSize = Math.round(screenWidth * 0.024);
  const paddingH = Math.round(screenWidth * 0.025);
  const paddingV = Math.round(screenWidth * 0.012);

  return (
    <View
      className={`flex-row items-center rounded-full ${className}`}
      style={[
        {
          backgroundColor: bgColor,
          borderWidth: 1,
          borderColor,
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={defaultIconSize} color={iconColor} style={{ marginRight: Math.round(screenWidth * 0.008) }} />
      <Text style={{ color: textColor, fontSize: defaultFontSize, fontWeight: '600', ...textStyle }}>{label}</Text>
    </View>
  );
}