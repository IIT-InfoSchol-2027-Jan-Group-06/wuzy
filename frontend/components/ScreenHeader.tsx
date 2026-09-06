import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyFonts } from '@/constants/wuzy-theme';
import { useResponsive } from '@/hooks/useResponsive';

/** Pushed-screen header: back button left, Bebas title centered on the row, optional action on the right. Exactly one GlassNavButton tall. Relies on Screen for padding. */
export function ScreenHeader({ title, right }: { title: string; right?: ReactNode }) {
  const router = useRouter();
  const { screenWidth, fontSize } = useResponsive();
  const height = Math.round((50 / 375) * screenWidth);

  return (
    <View className="flex-row items-center justify-between" style={{ height }}>
      <GlassNavButton icon="arrow-back" onPress={() => router.back()} />
      {/* the title is an overlay so it stays centered no matter how wide the right control is */}
      <View pointerEvents="none" className="absolute inset-x-0 items-center justify-center" style={{ height }}>
        <Text
          className="uppercase text-wuzy-yellow"
          style={{
            fontFamily: wuzyFonts.display,
            fontSize: fontSize('title'),
            lineHeight: Math.round(fontSize('title') * 1.05),
            includeFontPadding: false,
          }}>
          {title}
        </Text>
      </View>
      <View className="items-end justify-center">{right}</View>
    </View>
  );
}
