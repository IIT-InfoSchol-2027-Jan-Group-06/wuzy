import { CameraView as Camera, CameraType, useCameraPermissions } from 'expo-camera';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import { Pressable, Text, View, StyleSheet, TouchableOpacity, Image, ActivityIndicator, useWindowDimensions, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useRef, useCallback, memo, useImperativeHandle, forwardRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyFonts } from '@/constants/wuzy-theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type CameraComponentRef = {
  takePicture: () => void;
};

const CameraComponent = forwardRef<CameraComponentRef, { type: CameraType; onPictureTaken: (uri: string) => void }>(({ type, onPictureTaken }, ref) => {
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

  useImperativeHandle(ref, () => ({
    takePicture,
  }));

  return (
    <Camera
      ref={cameraRef}
      type={type}
      style={[
        StyleSheet.absoluteFillObject,
        { transform: [{ scale: 1.05 }] }
      ]}
      useCamera2Api={true}
    />
  );
});

export default function UploadScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraComponentRef>(null);
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
            <View style={{ width: screenWidth - 40, height: Math.round((screenWidth - 40) * (418 / 335)), borderRadius: 40, overflow: 'hidden' }}>
              <Image
                source={{ uri: capturedPhoto }}
                style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
              />
            </View>
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
            <View style={{ width: screenWidth - 40, height: Math.round((screenWidth - 40) * (418 / 335)), borderRadius: 40, overflow: 'hidden' }}>
              <CameraComponent
                ref={cameraRef}
                key={cameraType}
                type={cameraType}
                onPictureTaken={handlePictureTaken}
              />
            </View>
            <View className="mt-20 w-full px-6 pb-[58px] flex-row items-center justify-between max-w-[400px] mx-auto">
              <TouchableOpacity
                onPress={pickFromGallery}
                className="w-14 h-14 rounded-lg bg-white/10 items-center justify-center border border-white/20 backdrop-blur-sm">
                <Ionicons name="image-outline" size={28} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => cameraRef.current?.takePicture()}
                className="w-32 h-32 rounded-full border-4 border-white items-center justify-center"
                activeOpacity={0.8}>
                <View className="w-20 h-20 rounded-full border-2 border-white bg-white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={flipCamera}
                className="w-14 h-14 rounded-full bg-white/10 items-center justify-center border border-white/20 backdrop-blur-sm">
                <Ionicons name="camera-reverse-outline" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
