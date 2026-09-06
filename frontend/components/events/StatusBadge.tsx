import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { wuzyColors, wuzyFonts, wuzyType } from '@/constants/wuzy-theme';

/** Mauve status pill with a flame, for event tags like Selling fast. Deliberately not the yellow Chip. */
export function StatusBadge({ label }: { label: string }) {
  return (
    <View
      className="flex-row items-center rounded-full"
      style={{ backgroundColor: wuzyColors.badgeFill, borderWidth: 1, borderColor: wuzyColors.badgeBorder, paddingHorizontal: 10, paddingVertical: 5, gap: 4 }}>
      <Ionicons name="flame" size={12} color={wuzyColors.badgeText} />
      <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.caption, color: wuzyColors.badgeText }}>{label}</Text>
    </View>
  );
}
