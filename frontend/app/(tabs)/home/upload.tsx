import { CameraView as Camera, CameraType, useCameraPermissions } from 'expo-camera';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import { Pressable, Text, View, StyleSheet, TouchableOpacity, Image, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useRef, useCallback, memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyFonts } from '@/constants/wuzy-theme';

const CameraComponent = memo(({ type, onPictureTaken, onFlip }: { type: CameraType; onPictureTaken: (uri: string) => void; onFlip: () => void }) => {
  const cameraRef = useRef<Camera>(null);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      onPictureTaken(photo.uri);
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  }, [onPictureTaken]);

  return (
    <Camera
      ref={cameraRef}
      type={type}
      style={StyleSheet.absoluteFillObject}
      useCamera2Api={true}
    >
      <View className="absolute bottom-0 left-0 right-0 p-6 flex-row items-center justify-between">
        <TouchableOpacity
          className="w-14 h-14 rounded-full bg-white/20 items-center justify-center border border-white/30">
          <Ionicons name="image-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={takePicture}
          className="w-20 h-20 rounded-full border-4 border-white/50 items-center justify-center">
          <View className="w-14 h-14 rounded-full border-2 border-white bg-white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onFlip}
          className="w-14 h-14 rounded-full bg-white/20 items-center justify-center border border-white/30">
          <Ionicons name="camera-reverse-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Camera>
  );
});

export default function UploadScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth - 40;
  const cardHeight = Math.round(cardWidth * (418 / 335));
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [hasPermission, requestCameraPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const flipCamera = () => {
    setCameraType(prev => prev === 'back' ? 'front' : 'back');
  };

  const handlePictureTaken = (uri: string) => {
    setCapturedPhoto(uri);
    setShowPreview(true);
  };

  const pickFromGallery = async () => {
    try {
      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [418, 335],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setCapturedPhoto(result.assets[0].uri);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error picking from gallery:', error);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setShowPreview(false);
  };

  const confirmPhoto = () => {
    if (capturedPhoto) {
      router.push({
        pathname: '/home/post-preview',
        params: { imageUri: capturedPhoto },
      });
    }
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 bg-wuzy-bg items-center justify-center">
        <ActivityIndicator size="large" color="#FFE783" />
      </View>
    );
  }

  if (!hasPermission?.granted) {
    return (
      <View className="flex-1 bg-wuzy-bg items-center justify-center px-6">
        <Text className="text-wuzy-yellow text-center" style={{ fontFamily: wuzyFonts.display, fontSize: 28 }}>
          Camera Permission Required
        </Text>
        <Text className="text-gray text-center mt-4" style={{ fontFamily: wuzyFonts.regular, fontSize: 16 }}>
          Please enable camera access in settings to take photos.
        </Text>
        <Pressable
          className="mt-6 px-8 py-3 rounded-full border border-wuzy-yellow"
          onPress={requestCameraPermission}>
          <Text className="text-wuzy-yellow" style={{ fontFamily: wuzyFonts.semibold, fontSize: 16 }}>
            Grant Permission
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: '#0A0F17' }}>
      <SafeAreaView className="flex-1" style={{ backgroundColor: 'transparent' }}>
        <View className="flex-row items-center justify-between px-6 pt-6">
          <GlassNavButton
            icon="arrow-back"
            onPress={() => router.back()}
            className="absolute top-6 left-6 z-50"
          />
          <View style={{ width: 50 }} />
        </View>

        {showPreview && capturedPhoto ? (
          <View className="flex-1 items-center justify-center">
            <Image
              source={{ uri: capturedPhoto }}
              style={{ width: cardWidth, height: cardHeight, resizeMode: 'cover' }}
            />
            <View className="absolute bottom-0 left-0 right-0 p-6 flex-row justify-between">
              <GlassNavButton
                icon="refresh"
                onPress={retakePhoto}
                size={56}
              />
              <GlassNavButton
                icon="checkmark"
                onPress={confirmPhoto}
                size={56}
              />
            </View>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center">
            <View style={{ width: cardWidth, height: cardHeight }}>
              <CameraComponent
                key={cameraType}
                type={cameraType}
                onPictureTaken={handlePictureTaken}
                onFlip={flipCamera}
              />
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}