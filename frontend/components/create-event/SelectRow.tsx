import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { wuzyColors, wuzyFonts, wuzyType } from '@/constants/wuzy-theme';

export interface SelectRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
}

/** Horizontal row: bold white label on the left, gold select link on the right. */
export function SelectRow({ label, value, onPress }: SelectRowProps) {
  return (
    <Pressable onPress={onPress} className="w-full flex-row items-center justify-between py-[16px] active:opacity-75">
      <Text
        style={{
          fontFamily: wuzyFonts.semibold,
          fontSize: wuzyType.body,
          color: wuzyColors.yellow,
        }}>
        {label}
      </Text>
      <View className="flex-row items-center gap-[6px]">
        <Text
          style={{
            fontFamily: wuzyFonts.medium,
            fontSize: wuzyType.small,
            color: wuzyColors.yellow,
          }}>
          {value ?? `select ${label.toLowerCase()}`}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={wuzyColors.yellow} />
      </View>
    </Pressable>
  );
}