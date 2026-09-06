import { Text } from 'react-native';

import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

/** Centered glass pill with the GlassNavButton treatment. */
export function PublishButton({ onPress }: { onPress?: () => void }) {
  return (
    <GlassNavButton
      onPress={onPress ?? (() => {})}
      accessibilityLabel="Publish"
      style={{ width: 200, height: wuzyLayout.control, alignSelf: 'center' }}>
      <Text style={{ fontFamily: wuzyFonts.bold, fontSize: wuzyType.section, color: wuzyColors.white }}>Publish</Text>
    </GlassNavButton>
  );
}
