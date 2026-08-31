import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';

import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

export interface OnboardingBackdropProps {
  title?: string;
  subtitle?: string;
  background?: ImageSourcePropType;
  showBack?: boolean;
  children: ReactNode;
}

export function OnboardingBackdrop({
  title,
  subtitle,
  background = require('@/assets/images/onboarding-bg.jpg'),
  showBack = true,
  children,
}: OnboardingBackdropProps) {
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();

  return (
    <View style={{ flex: 1, overflow: 'hidden', backgroundColor: wuzyColors.bg }}>
      <Image source={background} contentFit="cover" style={StyleSheet.absoluteFillObject} />
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.78)' }}>
        <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
          <Text
            style={{
              marginTop: Math.round(screenWidth * 0.1),
              textAlign: 'center',
              color: wuzyColors.yellow,
              fontFamily: wuzyFonts.display,
              fontSize: Math.round(screenWidth * 0.133),
              letterSpacing: 0.48,
            }}>
            WUZY
          </Text>

          {showBack && (
            <View
              style={{
                position: 'absolute',
                left: Math.round(screenWidth * 0.08),
                top: Math.round(screenWidth * 0.075),
              }}>
              <GlassNavButton icon="arrow-back" onPress={() => router.back()} />
            </View>
          )}

          {title ? (
            <Text
              style={{
                marginTop: Math.round(screenWidth * 0.18),
                textAlign: 'center',
                color: wuzyColors.yellow,
                fontFamily: wuzyFonts.bold,
                fontSize: Math.round(screenWidth * 0.055),
              }}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text
              style={{
                marginTop: 4,
                textAlign: 'center',
                color: '#AFA991',
                fontFamily: wuzyFonts.body,
                fontSize: Math.round(screenWidth * 0.039),
                letterSpacing: 0.14,
              }}>
              {subtitle}
            </Text>
          ) : null}

          <View
            style={{
              flex: 1,
              alignItems: 'center',
              marginTop: Math.round(screenWidth * 0.26),
              paddingBottom: Math.round(screenWidth * 0.18),
              gap: Math.round(screenWidth * 0.083),
            }}>
            {children}
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}
