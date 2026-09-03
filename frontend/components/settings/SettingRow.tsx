import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { wuzyFonts, wuzyColors } from '@/constants/wuzy-theme';

export function SettingRow({
  icon,
  label,
  onPress,
  showChevron = true,
  iconColor = wuzyColors.white,
  labelColor = wuzyColors.white,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
  iconColor?: string;
  labelColor?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center justify-between py-3.5"
      android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
    >
      <View className="flex-row items-center">
        <Ionicons name={icon} size={22} color={iconColor} className="mr-4" />
        <Text style={{ fontFamily: wuzyFonts.medium, fontSize: 15, color: labelColor }}>{label}</Text>
      </View>
      {showChevron && <Ionicons name="chevron-forward" size={18} color="#8A919A" />}
    </Pressable>
  );
}
