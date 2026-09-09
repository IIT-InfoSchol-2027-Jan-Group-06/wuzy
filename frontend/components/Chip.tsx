import { Pressable, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { wuzyColors, wuzyFonts, wuzyType } from '@/constants/wuzy-theme';

/** The one pill shape for filters, tags, and labels. Selected = solid yellow, otherwise dim yellow fill.
 *  When `showRemove` is true, a close (x) icon is rendered on the right. */
export function Chip({
  label,
  selected,
  onPress,
  onRemove,
  showRemove = false,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  showRemove?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={selected === undefined ? undefined : { selected }}
      className={`items-center justify-center rounded-full px-[16px] py-[8px] active:opacity-75 ${
        selected ? 'bg-wuzy-yellow' : 'bg-wuzy-yellowDim'
      }`}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <Text
          style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: selected ? wuzyColors.bg : wuzyColors.yellow }}
        >
          {label}
        </Text>
        {showRemove && onRemove && (
          <Pressable
            onPress={onRemove}
            style={{ padding: 2, justifyContent: 'center', alignItems: 'center' }}
          >
            <Ionicons name="close" size={12} color={wuzyColors.gray} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
