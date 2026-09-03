import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { wuzyFonts, wuzyColors } from '@/constants/wuzy-theme';

export function ToggleRow({
  icon,
  label,
  value,
  onValueChange,
  iconColor = wuzyColors.white,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  iconColor?: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-3.5">
      <View className="flex-row items-center gap-4">
        <Ionicons name={icon} size={22} color={iconColor} />
        <Text style={{ fontFamily: wuzyFonts.medium, fontSize: 15, color: wuzyColors.white }}>{label}</Text>
      </View>
      <TouchableOpacity
        onPress={() => onValueChange(!value)}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        className={`w-12 h-6 rounded-full flex-row items-center px-1 ${
          value ? 'bg-[#F0CD6D] justify-end' : 'bg-[#3A3F47] justify-start'
        }`}
      >
        <View className="w-4 h-4 rounded-full bg-white" />
      </TouchableOpacity>
    </View>
  );
}
