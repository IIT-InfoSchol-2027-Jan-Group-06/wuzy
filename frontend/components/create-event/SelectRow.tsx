import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

export interface SelectRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
}

/** Horizontal row: bold white label on the left, gold select link on the right. */
export function SelectRow({ label, value, onPress }: SelectRowProps) {
  const { width: screenWidth } = useWindowDimensions();

  const labelFontSize = Math.round(screenWidth * 0.04);
  const linkFontSize = Math.round(screenWidth * 0.032);
  const chevronSize = Math.round(screenWidth * 0.036);

  return (
    <Pressable onPress={onPress} className="w-full flex-row items-center justify-between py-[16px] active:opacity-75">
      <Text
        style={{
          fontFamily: wuzyFonts.semibold,
          fontSize: labelFontSize,
          color: wuzyColors.yellow,
        }}>
        {label}
      </Text>
      <View className="flex-row items-center gap-[6px]">
        <Text
          style={{
            fontFamily: wuzyFonts.medium,
            fontSize: linkFontSize,
            color: wuzyColors.yellow,
          }}>
          {value ?? `select ${label.toLowerCase()}`}
        </Text>
        <Ionicons name="chevron-forward" size={chevronSize} color={wuzyColors.yellow} />
      </View>
    </Pressable>
  );
}