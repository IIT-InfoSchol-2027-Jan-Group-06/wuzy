import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

/** Header for the photo capture/send flows: optional back button left, a
 * label (the flow's title, e.g. "CAMERA" or "GALLERY") vertically centered on
 * the same row, optional action on the right. Exactly one GlassNavButton tall,
 * mirroring ScreenHeader but with the title in Poppins. The confirm frame sets
 * showBack={false}: its only way out is the retake button below the photo. The
 * label is Poppins semibold `section` in `wuzy-yellow`, a step up from the
 * connection-name style it started as. */
export function CameraHeader({
  right,
  showBack = true,
  title = 'CAMERA',
}: {
  right?: ReactNode;
  showBack?: boolean;
  /** The frame's caption, e.g. "CAMERA" on the camera send frame and "GALLERY" on the gallery one. */
  title?: string;
}) {
  const router = useRouter();
  const height = wuzyLayout.glass;

  return (
    <View className="flex-row items-center justify-between" style={{ height }}>
      {showBack ? (
        <GlassNavButton icon="arrow-back" onPress={() => router.back()} />
      ) : (
        <View style={{ width: wuzyLayout.glass, height: wuzyLayout.glass }} />
      )}
      {/* the title is an overlay so it stays centered no matter how wide the right control is */}
      <View pointerEvents="none" className="absolute inset-x-0 items-center justify-center" style={{ height }}>
        <Text
          style={{
            fontFamily: wuzyFonts.semibold,
            fontSize: wuzyType.section,
            color: wuzyColors.yellow,
            includeFontPadding: false,
          }}>
          {title}
        </Text>
      </View>
      <View className="items-end justify-center">{right}</View>
    </View>
  );
}