import { Image } from 'expo-image';
import { Text, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { CameraHeader } from '@/components/camera/CameraHeader';
import { GlassNavButton } from '@/components/GlassNavButton';
import { Screen } from '@/components/Screen';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { getPendingPhoto, setPendingPhoto } from '@/lib/media';

/** Photo-confirm frame in the chat camera flow: the picture exactly as the
 * post-preview layout shows it, no back button. The retake (refresh) and use
 * (checkmark) glass buttons sit as a pair 30 below the picture, centered as a
 * unit. Retake drops the photo and returns to the live camera; use advances to
 * the caption + Send frame (camera-send.tsx). "CAMERA" sits centered via the
 * shared CameraHeader. */
export default function CameraPreviewScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const { id, kind, otherUserId } = useLocalSearchParams<{ id?: string; kind?: string; otherUserId?: string }>();
  const imageUri = getPendingPhoto();
  const photoLayout = { width: '100%' as const, maxWidth: 400, aspectRatio: 335 / 418, borderRadius: 24, overflow: 'hidden' as const };
  // Both glass buttons grow 20% from GlassNavButton's default size, which
  // scales with the screen width; the size prop scales icon and fill together.
  const buttonSize = Math.round(Math.round((50 / 375) * screenWidth) * 1.2);

  const confirm = () => {
    if (!imageUri) return;
    router.push({ pathname: '/camera-send', params: { id, kind, otherUserId } });
  };

  const retake = () => {
    setPendingPhoto(null);
    router.back();
  };

  return (
    <Screen>
      <CameraHeader showBack={false} />

      <View className="flex-1 items-center" style={{ paddingTop: wuzyLayout.gap + 10 }}>
        {imageUri ? (
          <View style={photoLayout}>
            <Image source={imageUri} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          </View>
        ) : (
          <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.body, color: wuzyColors.gray }}>
            No photo captured
          </Text>
        )}

        <View className="flex-row items-center" style={{ marginTop: 30, gap: 40 }}>
          <GlassNavButton size={buttonSize} icon="refresh" accessibilityLabel="Retake photo" onPress={retake} />
          <GlassNavButton size={buttonSize} icon="checkmark" accessibilityLabel="Use photo" onPress={confirm} />
        </View>
      </View>
    </Screen>
  );
}