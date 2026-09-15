import { CameraType, useCameraPermissions } from 'expo-camera';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';

import { CameraCapture, type CameraCaptureRef } from '@/components/camera/CameraCapture';
import { Chip } from '@/components/Chip';
import { GlassNavButton } from '@/components/GlassNavButton';
import { Screen } from '@/components/Screen';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { setPendingPhoto } from '@/lib/media';

export default function UploadScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraCaptureRef>(null);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [hasPermission, requestCameraPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const viewport = { width: '100%' as const, maxWidth: 400, aspectRatio: 335 / 418, borderRadius: 24, overflow: 'hidden' as const };

  const flipCamera = () => {
    setCameraType((prev) => (prev === 'back' ? 'front' : 'back'));
    setIsCameraReady(false);
  };

  const pickFromGallery = async () => {
    try {
      const result = await launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [335, 418], quality: 0.8 });
      if (!result.canceled && result.assets[0]) setCapturedPhoto(result.assets[0].uri);
    } catch (error) {
      console.error('Error picking from gallery:', error);
    }
  };

  const confirmPhoto = () => {
    if (!capturedPhoto) return;
    setPendingPhoto(capturedPhoto);
    router.push({ pathname: '/post-preview', params: { imageUri: capturedPhoto } });
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
        <GlassNavButton icon="arrow-back" onPress={() => router.back()} />
        <View className="flex-1 items-center justify-center" style={{ gap: wuzyLayout.itemGap }}>
          <Text className="text-wuzy-yellow text-center" style={{ fontFamily: wuzyFonts.display, fontSize: wuzyType.title }}>
            Camera access needed
          </Text>
          <Text className="text-center text-wuzy-gray" style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.body }}>
            Allow camera access to take photos for your posts.
          </Text>
          <View style={{ marginTop: wuzyLayout.itemGap }}>
            <Chip label="Allow camera" selected onPress={requestCameraPermission} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <GlassNavButton icon="arrow-back" onPress={() => router.back()} />

      <View className="flex-1 items-center justify-center" style={{ gap: wuzyLayout.gap }}>
        <View style={viewport}>
          {capturedPhoto ? (
            <Image source={capturedPhoto} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <CameraCapture ref={cameraRef} key={cameraType} type={cameraType} onPictureTaken={setCapturedPhoto} onReadyChange={setIsCameraReady} />
          )}
        </View>

        {capturedPhoto ? (
          <View className="w-full flex-row items-center justify-evenly">
            <GlassNavButton icon="refresh" accessibilityLabel="Retake" onPress={() => setCapturedPhoto(null)} />
            <GlassNavButton icon="checkmark" accessibilityLabel="Use photo" onPress={confirmPhoto} />
          </View>
        ) : (
          <View className="w-full flex-row items-center justify-between">
            <GlassNavButton icon="image-outline" accessibilityLabel="Pick from gallery" onPress={pickFromGallery} />
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
        )}
      </View>
    </Screen>
  );
}
