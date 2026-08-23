import { Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';

import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyFonts } from '@/constants/wuzy-theme';

/** Pushed-screen header: back button on the left, Bebas title centered against it. */
export function ScreenHeader({ title }: { title: string }) {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const backButtonSize = Math.round((42 / 375) * screenWidth);

  return (
    <View className="flex-row items-center px-[32px] pt-[49px]">
      <GlassNavButton icon="arrow-back" size={backButtonSize} onPress={() => router.back()} />
      <Text
        className="flex-1 text-center text-wuzy-yellow"
        style={{ fontFamily: wuzyFonts.display, fontSize: Math.round(screenWidth * 0.061) }}>
        {title}
      </Text>
      {/* spacer keeps the title centered against the back button */}
      <View style={{ width: backButtonSize }} />
    </View>
  );
}
