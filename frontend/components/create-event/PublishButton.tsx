import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { wuzyFonts } from '@/constants/wuzy-theme';

export interface PublishButtonProps {
  onPress?: () => void;
}

/** Compact centered pill action button with the GlassNavButton treatment (no yellow tint). */
export function PublishButton({ onPress }: PublishButtonProps) {
  const { width: screenWidth } = useWindowDimensions();

  const height = Math.round(screenWidth * 0.13);
  const width = Math.round(screenWidth * 0.5);
  const textFontSize = Math.round(screenWidth * 0.042);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="items-center justify-center self-center overflow-hidden rounded-full active:opacity-80"
      style={{ height, width }}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
      <View style={StyleSheet.absoluteFillObject}>
        <View
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: 'rgba(84, 82, 56, 0.35)' }}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.03)', 'rgba(0,0,0,0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0.25)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View className="absolute inset-0 rounded-full border border-white/30" />
        <View
          className="absolute top-0 left-0 right-0 rounded-t-full border-t border-white/50"
          style={{ height: height * 0.5 }}
        />
        <View
          className="absolute bottom-0 left-0 right-0 rounded-b-full border-b border-black/30"
          style={{ height: height * 0.5 }}
        />
      </View>
      <Text
        className="relative z-10"
        style={{ fontFamily: wuzyFonts.bold, fontSize: textFontSize, color: '#FFFFFF' }}>
        Publish
      </Text>
    </Pressable>
  );
}