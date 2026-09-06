import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyFonts } from '@/constants/wuzy-theme';
import { useResponsive } from '@/hooks/useResponsive';

/** Pushed-screen header: back button left, Bebas title centered, optional action on the right. Relies on Screen for padding. */
export function ScreenHeader({ title, right }: { title: string; right?: ReactNode }) {
  const router = useRouter();
  const { screenWidth, fontSize } = useResponsive();
  const slot = Math.round((50 / 375) * screenWidth);

  return (
    <View className="flex-row items-center">
      <GlassNavButton icon="arrow-back" onPress={() => router.back()} />
      <Text
        className="flex-1 text-center uppercase text-wuzy-yellow"
        style={{ fontFamily: wuzyFonts.display, fontSize: fontSize('title') }}>
        {title}
      </Text>
      {/* the right slot is at least as wide as the back button so the title stays centered */}
      <View className="items-end justify-center" style={{ minWidth: slot }}>
        {right}
      </View>
    </View>
  );
}
