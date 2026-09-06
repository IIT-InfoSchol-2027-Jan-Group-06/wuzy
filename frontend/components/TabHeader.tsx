import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

/** Tab-root header: Bebas display title on the left, optional glass buttons on the right. Exactly one GlassNavButton tall, so every tab title lands on the same y with or without a button. */
export function TabHeader({ title, right }: { title: string; right?: ReactNode }) {
  const height = wuzyLayout.glass;

  return (
    <View className="flex-row items-center justify-between" style={{ height }}>
      <Text
        className="text-wuzy-yellow"
        style={{
          fontFamily: wuzyFonts.display,
          fontSize: wuzyType.display,
          lineHeight: Math.round(wuzyType.display * 1.05),
          includeFontPadding: false,
        }}>
        {title}
      </Text>
      {right ? (
        <View className="flex-row items-center" style={{ gap: 12 }}>
          {right}
        </View>
      ) : null}
    </View>
  );
}
