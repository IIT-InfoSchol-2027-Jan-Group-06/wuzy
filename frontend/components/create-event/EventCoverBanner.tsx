import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { wuzyFonts } from '@/constants/wuzy-theme';

export interface EventCoverBannerProps {
  imageUri?: ImageSourcePropType;
  onPress?: () => void;
}

/** Rounded cover preview: shows an image when provided, otherwise a placeholder slot. */
export function EventCoverBanner({ imageUri, onPress }: EventCoverBannerProps) {
  const { width: screenWidth } = useWindowDimensions();

  const height = Math.round(screenWidth * 0.42);
  const radius = Math.round(screenWidth * 0.04);
  const iconSize = Math.round(screenWidth * 0.07);
  const hintFontSize = Math.round(screenWidth * 0.03);

  return (
    <Pressable
      onPress={onPress}
      className="w-full items-center justify-center overflow-hidden active:opacity-75"
      style={{
        height,
        borderRadius: radius,
        borderWidth: 1,
        borderColor: '#2B3545',
        backgroundColor: '#171E28',
      }}>
      {imageUri ? (
        <Image source={imageUri} style={{ width: '100%', height: '100%' }} contentFit="cover" />
      ) : (
        <View className="items-center gap-[8px]">
          <Ionicons name="image-outline" size={iconSize} color="rgba(255, 231, 131, 0.5)" />
          <Text style={{ fontFamily: wuzyFonts.body, fontSize: hintFontSize, color: '#888888' }}>
            Event Cover
          </Text>
        </View>
      )}
    </Pressable>
  );
}