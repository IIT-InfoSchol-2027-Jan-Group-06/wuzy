import { Text, type StyleProp, type ViewStyle } from 'react-native';

import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

interface GlassPillButtonProps {
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  numberOfLines?: number;
  accessibilityLabel?: string;
  /** Bold label (semibold) vs the regular label weight; defaults to bold. */
  bold?: boolean;
}

/** Glass-nav-bar pill: a `GlassNavButton` stretched into a `control`-tall rounded pill by its `children`. The Edit profile / Connections / Go to profile / Refer to a friend button. */
export function GlassPillButton({ label, onPress, style, numberOfLines, accessibilityLabel, bold = true }: GlassPillButtonProps) {
  return (
    <GlassNavButton
      onPress={onPress ?? (() => {})}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[{ height: wuzyLayout.control }, style]}>
      <Text
        numberOfLines={numberOfLines}
        style={{ fontFamily: bold ? wuzyFonts.semibold : wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.white, textAlign: 'center' }}>
        {label}
      </Text>
    </GlassNavButton>
  );
}