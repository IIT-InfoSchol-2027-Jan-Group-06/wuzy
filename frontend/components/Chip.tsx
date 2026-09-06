import { Pressable, Text } from 'react-native';

import { wuzyFonts } from '@/constants/wuzy-theme';
import { useResponsive } from '@/hooks/useResponsive';

/** The one pill shape for filters, tags, and labels. Selected = solid yellow, otherwise dim yellow fill. */
export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  const { fontSize } = useResponsive();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={selected === undefined ? undefined : { selected }}
      className={`items-center justify-center rounded-full px-[16px] py-[8px] active:opacity-75 ${
        selected ? 'bg-wuzy-yellow' : 'bg-wuzy-yellowDim'
      }`}>
      <Text
        className={selected ? 'text-wuzy-bg' : 'text-wuzy-yellow'}
        style={{ fontFamily: wuzyFonts.semibold, fontSize: fontSize('small') }}>
        {label}
      </Text>
    </Pressable>
  );
}
