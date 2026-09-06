import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

export interface EventCoverBannerProps {
  imageUri?: ImageSourcePropType;
  onPress?: () => void;
}

/** Rounded cover preview: shows an image when provided, otherwise a placeholder slot. */
export function EventCoverBanner({ imageUri, onPress }: EventCoverBannerProps) {
  const { width } = useWindowDimensions();
  const height = Math.min(Math.round((width - 2 * wuzyLayout.side) * 0.42), 180);
  return (
    <Pressable
      onPress={onPress}
      className="w-full items-center justify-center overflow-hidden active:opacity-75"
      style={{
        height,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#2B3545',
        backgroundColor: '#171E28',
      }}>
      {imageUri ? (
        <Image source={imageUri} style={{ width: '100%', height: '100%' }} contentFit="cover" />
      ) : (
        <View className="items-center gap-[8px]">
          <Ionicons name="image-outline" size={28} color="rgba(255, 231, 131, 0.5)" />
          <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.gray }}>
            Event Cover
          </Text>
        </View>
      )}
    </Pressable>
  );
}