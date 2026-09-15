import { CameraType, useCameraPermissions } from 'expo-camera';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useRef } from 'react';

import { CameraCapture, type CameraCaptureRef } from '@/components/camera/CameraCapture';
import { CameraHeader } from '@/components/camera/CameraHeader';
import { Chip } from '@/components/Chip';
import { GlassNavButton } from '@/components/GlassNavButton';
import { Screen } from '@/components/Screen';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { setPendingPhoto } from '@/lib/media';

/** Camera frame for the chat attach flow: live preview on the upload.tsx
 * layout minus the gallery picker, ending in the photo-confirm and caption
 * screens. The thread id, kind, and DM recipient ride along so the final Send
 * targets the chat the attach sheet was opened from. */
export default function CameraScreen() {
  const router = useRouter();
  const { id, kind, otherUserId } = useLocalSearchParams<{ id?: string; kind?: string; otherUserId?: string }>();
  const cameraRef = useRef<CameraCaptureRef>(null);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [hasPermission, requestCameraPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);

  const viewport = { width: '100%' as const, maxWidth: 400, aspectRatio: 335 / 418, borderRadius: 24, overflow: 'hidden' as const };

  const flipCamera = () => {
    setCameraType((prev) => (prev === 'back' ? 'front' : 'back'));
    setIsCameraReady(false);
  };

  const onPictureTaken = (uri: string) => {
    // The captured file path contains percent-encoding; hand it over out-of-band.
    setPendingPhoto(uri);
    router.push({ pathname: '/camera-preview', params: { id, kind, otherUserId } });
  };

  if (hasPermission === null) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={wuzyColors.yellow} />
        </View>
      </Screen>
    );
  }

  if (!hasPermission?.granted) {
    return (
      <Screen>
        <CameraHeader right={<View />} />
        <View className="flex-1 items-center justify-center" style={{ gap: wuzyLayout.itemGap }}>
          <Text className="text-wuzy-yellow text-center" style={{ fontFamily: wuzyFonts.display, fontSize: wuzyType.title }}>
            Camera access needed
          </Text>
          <Text className="text-center text-wuzy-gray" style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.body }}>
            Allow camera access to take and send photos in chat.
          </Text>
          <View style={{ marginTop: wuzyLayout.itemGap }}>
            <Chip label="Allow camera" selected onPress={requestCameraPermission} />
          </View>
        </View>
      </Screen>
    );
  }

  const glassSize = Math.round((50 / 375) * 375);

  return (
    <Screen>
      <CameraHeader right={<View />} />

      <View className="flex-1 items-center" style={{ paddingTop: wuzyLayout.gap + 10, gap: 30 }}>
        <View style={viewport}>
          <CameraCapture ref={cameraRef} key={cameraType} type={cameraType} onPictureTaken={onPictureTaken} onReadyChange={setIsCameraReady} />
        </View>

        <View className="w-full flex-row items-center justify-between">
          {/* invisible twin of the flip button keeps the shutter centered */}
          <View style={{ width: glassSize, height: glassSize }} />
          <Pressable
            onPress={() => cameraRef.current?.takePicture()}
            disabled={!isCameraReady}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
            className="items-center justify-center rounded-full border-4 border-white active:opacity-80"
            style={{ width: 80, height: 80, opacity: isCameraReady ? 1 : 0.5 }}>
            <View className="rounded-full bg-white" style={{ width: 64, height: 64 }} />
          </Pressable>
          <GlassNavButton icon="camera-reverse-outline" accessibilityLabel="Flip camera" onPress={flipCamera} />
        </View>
      </View>
    </Screen>
  );
}