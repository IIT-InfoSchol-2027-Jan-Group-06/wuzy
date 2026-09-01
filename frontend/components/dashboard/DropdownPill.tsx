import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, useWindowDimensions } from 'react-native';

import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

type DropdownPillProps = {
  label: string;
  onPress: () => void;
};

/** Rounded selector pill showing the active range with a chevron affordance. */
export function DropdownPill({ label, onPress }: DropdownPillProps) {
  const { width: screenWidth } = useWindowDimensions();
  const height = Math.round(screenWidth * 0.088);
  const pillRadius = height / 2;
  const labelSize = Math.round(screenWidth * 0.026);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center"
      style={{ backgroundColor: '#2A2D24', borderRadius: pillRadius, height, paddingHorizontal: Math.round(screenWidth * 0.04) }}>
      <Text style={{ color: wuzyColors.white, fontFamily: wuzyFonts.medium, fontSize: labelSize }}>
        {label}
      </Text>
      <Ionicons
        name="chevron-down"
        size={Math.round(screenWidth * 0.03)}
        color={wuzyColors.white}
        style={{ marginLeft: Math.round(screenWidth * 0.015) }}
      />
    </Pressable>
  );
}
