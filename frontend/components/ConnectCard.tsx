import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { GlassNavButton } from '@/components/GlassNavButton';
import { QrCode } from '@/components/QrCode';
import { wuzyColors, wuzyFonts, wuzyLayout } from '@/constants/wuzy-theme';
import { useResponsive } from '@/hooks/useResponsive';

interface ConnectCardProps {
  username: string;
  qrValue: string;
  onBack: () => void;
  backgroundImage?: ImageSourcePropType;
}

/** Full-screen QR card over a blurred copy of the profile photo. Composes its own shell because the backdrop is full-bleed. */
export function ConnectCard({ username, qrValue, onBack, backgroundImage }: ConnectCardProps) {
  const { screenWidth, fontSize } = useResponsive();
  const cardWidth = screenWidth - 2 * wuzyLayout.side;
  const qrSize = Math.round(cardWidth * 0.6);

  return (
    <View className="flex-1 bg-wuzy-bg">
      {backgroundImage && <Image source={backgroundImage} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={50} />}
      <LinearGradient
        colors={['transparent', wuzyColors.bg, wuzyColors.bg]}
        locations={[0, 0.6, 1]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <View style={{ paddingTop: wuzyLayout.top, paddingHorizontal: wuzyLayout.side }}>
          <GlassNavButton icon="arrow-back" onPress={onBack} />
        </View>

        <View className="flex-1 items-center justify-center">
          <View className="overflow-hidden" style={{ width: cardWidth, borderRadius: 24 }}>
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: wuzyColors.glassFill }]} />
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)', 'rgba(0,0,0,0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={[StyleSheet.absoluteFill, { borderRadius: 24, borderWidth: 1, borderColor: wuzyColors.glassBorder }]} />

            <View className="items-center" style={{ padding: wuzyLayout.side, gap: wuzyLayout.itemGap }}>
              <Text className="uppercase" style={{ fontFamily: wuzyFonts.display, fontSize: fontSize('title'), letterSpacing: 2, color: wuzyColors.yellow }}>
                Connect
              </Text>
              <Text
                className="text-center uppercase"
                style={{ fontFamily: wuzyFonts.display, fontSize: fontSize('display'), lineHeight: Math.round(fontSize('display') * 1.1), color: wuzyColors.yellowSoft }}>
                {username}
              </Text>
              <View style={{ marginVertical: wuzyLayout.itemGap }}>
                <QrCode value={qrValue} size={qrSize} />
              </View>
              <Text style={{ fontFamily: wuzyFonts.body, fontSize: fontSize('body'), color: wuzyColors.white, opacity: 0.7 }}>Scan to connect</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
