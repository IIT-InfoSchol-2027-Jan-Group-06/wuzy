import { useState, type ReactNode } from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { GlassNavButton } from '@/components/GlassNavButton';
import { LiquidGlass } from '@/components/LiquidGlass';
import { QrCode } from '@/components/QrCode';
import { QrScanner } from '@/components/QrScanner';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

interface ConnectCardProps {
  username: string;
  qrValue: string;
  onBack: () => void;
  backgroundImage?: ImageSourcePropType;
  /** Set false to hide the back button row entirely (the referral QR screen). */
  showBack?: boolean;
  /** When set, replaces the mode toggle with a single "Done" pill. */
  doneLabel?: string;
  onDone?: () => void;
  /** Called after a successful scan so the screen can pop back to the Awards tab. */
  onConnected?: () => void;
}

// The inactive icon needs to read against the translucent glass half; the active one uses wuzyColors.bg.
const MODE_ICON_INACTIVE = '#282F36';

/** The frosted frame each mode shows in: blur, glass tint, gradient sheen, hairline border. */
function GlassPanel({ children }: { children: ReactNode }) {
  return (
    <View className="overflow-hidden" style={{ width: '100%', borderRadius: 24 }}>
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
        {children}
      </View>
    </View>
  );
}

/** Two-segment glass pill that flips the Connect card between the owner QR and the scanner. */
function ModeToggle({ camera, onToggle }: { camera: boolean; onToggle: (camera: boolean) => void }) {
  const iconSize = Math.round(wuzyLayout.glass * 0.48) + 3;
  const segment = (name: keyof typeof Ionicons.glyphMap, active: boolean, label: string, target: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={() => onToggle(target)}
      style={{
        width: wuzyLayout.glass + 30,
        height: wuzyLayout.control + 5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? wuzyColors.yellow : 'transparent',
      }}>
      <Ionicons
        name={name}
        size={iconSize}
        color={active ? wuzyColors.bg : MODE_ICON_INACTIVE}
        // Android pads icon fonts by default, which pushes the glyph off centre.
        style={{ includeFontPadding: false, textAlignVertical: 'center' }}
      />
    </Pressable>
  );

  return (
    <LiquidGlass style={{ flexDirection: 'row' }}>
      {segment('qr-code', !camera, 'Show my QR code', false)}
      <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: wuzyColors.yellow }} />
      {segment('camera', camera, 'Open scanner', true)}
    </LiquidGlass>
  );
}

/** Full-screen QR card over a blurred copy of the profile photo. Composes its own shell because the backdrop is full-bleed. */
export function ConnectCard({
  username,
  qrValue,
  onBack,
  backgroundImage,
  showBack = true,
  doneLabel,
  onDone,
  onConnected,
}: ConnectCardProps) {
  // The toggle pill flips the glass card between the owner's QR and the scanner.
  const [showCamera, setShowCamera] = useState(false);

  const connectTitle = (
    <Text className="uppercase" style={{ fontFamily: wuzyFonts.display, fontSize: wuzyType.title, letterSpacing: 2, color: wuzyColors.yellow }}>
      Connect
    </Text>
  );

  const qrSide = (
    <>
      <Text
        className="text-center uppercase"
        style={{ fontFamily: wuzyFonts.display, fontSize: wuzyType.display, lineHeight: Math.round(wuzyType.display * 1.1), color: wuzyColors.yellowSoft }}>
        {username}
      </Text>
      <View style={{ marginVertical: wuzyLayout.itemGap }}>
        <QrCode value={qrValue} size={200} />
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Scan to connect" onPress={() => setShowCamera(true)}>
        <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.body, color: wuzyColors.yellow, textDecorationLine: 'underline' }}>Scan to connect</Text>
      </Pressable>
    </>
  );

  const cameraSide = (
    <>
      <QrScanner onConnected={onConnected} />
      <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.body, color: wuzyColors.white, opacity: 0.7 }}>
        Point at another user&apos;s QR code
      </Text>
    </>
  );

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
        {showBack && (
          <View style={{ paddingTop: wuzyLayout.top, paddingHorizontal: wuzyLayout.side, flexDirection: 'row', justifyContent: 'space-between' }}>
            <GlassNavButton icon="arrow-back" onPress={onBack} accessibilityLabel="Back" />
          </View>
        )}

        <View className="flex-1 items-center justify-center" style={{ paddingHorizontal: wuzyLayout.side }}>
          <View style={{ alignItems: 'center', width: '100%', maxWidth: 400, gap: 40 }}>
            {doneLabel ? (
              <GlassNavButton
                onPress={onDone ?? (() => {})}
                accessibilityLabel={doneLabel}
                style={{ width: (wuzyLayout.glass + 30) * 2 + 1, height: wuzyLayout.control + 5 }}>
                <Text
                  style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.yellow }}>
                  {doneLabel}
                </Text>
              </GlassNavButton>
            ) : (
              <ModeToggle
                camera={showCamera}
                onToggle={(toCamera) => {
                  if (toCamera !== showCamera) setShowCamera(toCamera);
                }}
              />
            )}
            <GlassPanel>
              {connectTitle}
              {showCamera ? cameraSide : qrSide}
            </GlassPanel>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
