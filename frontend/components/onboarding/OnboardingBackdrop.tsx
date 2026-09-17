import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

export interface OnboardingBackdropProps {
  title?: string;
  subtitle?: string;
  /** Defaults to the signup photo; welcome and login pass their own. */
  background?: ImageSourcePropType;
  showBack?: boolean;
  /** Space under the last child, above the safe area. Signup pages use one gap like Buy ticket; welcome and login pass their Figma offsets. */
  paddingBottom?: number;
  children: ReactNode;
}

/** Shell for welcome, login, and every signup question: photo under a dark scrim, WUZY wordmark, back arrow, question, centered children. */
export function OnboardingBackdrop({
  title,
  subtitle,
  background = require('@/assets/images/onboarding-bg.jpg'),
  showBack = true,
  paddingBottom = wuzyLayout.gap,
  children,
}: OnboardingBackdropProps) {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: wuzyColors.bg }}>
      <Image source={background} contentFit="cover" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.78)' }]} />
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <Text
            style={{
              marginTop: 36,
              textAlign: 'center',
              color: wuzyColors.yellow,
              fontFamily: wuzyFonts.display,
              fontSize: wuzyType.hero,
              letterSpacing: 0.48,
            }}>
            WUZY
          </Text>

          {showBack && (
            <View style={{ position: 'absolute', left: wuzyLayout.side, top: wuzyLayout.top }}>
              <GlassNavButton icon="arrow-back" accessibilityLabel="Back" onPress={() => router.back()} />
            </View>
          )}

          {title ? (
            <Text
              style={{
                marginTop: 64,
                textAlign: 'center',
                color: wuzyColors.yellow,
                fontFamily: wuzyFonts.bold,
                fontSize: wuzyType.section,
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
                fontSize: wuzyType.small,
                letterSpacing: 0.14,
              }}>
              {subtitle}
            </Text>
          ) : null}

          <View
            style={{
              flex: 1,
              alignItems: 'center',
              marginTop: 96,
              paddingHorizontal: wuzyLayout.side,
              paddingBottom,
              gap: wuzyLayout.gap,
            }}>
            {children}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
