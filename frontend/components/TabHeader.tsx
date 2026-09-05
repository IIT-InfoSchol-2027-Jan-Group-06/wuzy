import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { wuzyFonts } from '@/constants/wuzy-theme';
import { useResponsive } from '@/hooks/useResponsive';

/** Tab-root header: Bebas display title on the left, optional glass buttons on the right. Always as tall as a GlassNavButton so titles share one baseline with or without a button. */
export function TabHeader({ title, right }: { title: string; right?: ReactNode }) {
  const { screenWidth, fontSize } = useResponsive();
  const minHeight = Math.round((50 / 375) * screenWidth);

  return (
    <View className="flex-row items-center justify-between" style={{ minHeight, paddingBottom: 8 }}>
      <Text
        className="text-wuzy-yellow"
        style={{ fontFamily: wuzyFonts.display, fontSize: fontSize('display'), lineHeight: fontSize('display') }}>
        {title}
      </Text>
      {right ? <View className="flex-row items-center" style={{ gap: 12 }}>{right}</View> : null}
    </View>
  );
}
