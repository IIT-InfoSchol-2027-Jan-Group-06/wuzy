import { Text } from 'react-native';

import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';
import { useResponsive } from '@/hooks/useResponsive';

/** Centered glass pill with the GlassNavButton treatment. */
export function PublishButton({ onPress }: { onPress?: () => void }) {
  const { screenWidth, fontSize } = useResponsive();

  return (
    <GlassNavButton
      onPress={onPress ?? (() => {})}
      accessibilityLabel="Publish"
      style={{ width: Math.round(screenWidth * 0.5), height: Math.round(screenWidth * 0.13), alignSelf: 'center' }}>
      <Text style={{ fontFamily: wuzyFonts.bold, fontSize: fontSize('section'), color: wuzyColors.white }}>Publish</Text>
    </GlassNavButton>
  );
}
