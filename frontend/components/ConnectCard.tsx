import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { GlassNavButton } from '@/components/GlassNavButton';
import { QrCode } from '@/components/QrCode';
import { QrScanner } from '@/components/QrScanner';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

interface ConnectCardProps {
  username: string;
  qrValue: string;
  onBack: () => void;
  backgroundImage?: ImageSourcePropType;
}

// Space left between the two glass cards while they slide past each other.
const SLIDE_GAP = 40;

/** The frosted frame each mode shows in: blur, glass tint, gradient sheen, hairline border. */
function GlassPanel({ width, children }: { width: number; children: ReactNode }) {
  return (
    <View className="overflow-hidden" style={{ width, borderRadius: 24 }}>
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

/** Full-screen QR card over a blurred copy of the profile photo. Composes its own shell because the backdrop is full-bleed. */
export function ConnectCard({ username, qrValue, onBack, backgroundImage }: ConnectCardProps) {
  // Swipe the card left to open the scanner, right to come back to the owner's QR.
  // Both sides share one sliding track of glass cards; progress is 0 on the QR and 1 on the camera.
  const [showCamera, setShowCamera] = useState(false);
  const [cardWidth, setCardWidth] = useState(0);
  const progress = useSharedValue(0);
  const width = useSharedValue(0);
  const start = useSharedValue(0);
  const armed = useSharedValue(false);

  const trackX = useAnimatedStyle(() => ({
    transform: [{ translateX: -progress.value * (width.value + SLIDE_GAP) }],
  }));

  const armCamera = useCallback(() => {
    setShowCamera(true);
  }, []);

  const commit = useCallback((toCamera: boolean) => {
    if (!toCamera) setShowCamera(false);
  }, []);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-12, 12])
        .onBegin(() => {
          // The compiler linter treats Reanimated shared values as immutable; they are mutable by design.
          // eslint-disable-next-line react-hooks/immutability
          start.value = progress.value;
        })
        .onUpdate((e) => {
          // eslint-disable-next-line react-hooks/immutability
          progress.value = Math.min(1, Math.max(0, start.value - e.translationX / Math.max(width.value + SLIDE_GAP, 1)));
          // Mount the scanner while the camera side is revealed, so the slide stays filled.
          if (progress.value > 0.02 && !armed.value) {
            // eslint-disable-next-line react-hooks/immutability
            armed.value = true;
            runOnJS(armCamera)();
          }
        })
        .onEnd((e) => {
          const toCamera = e.velocityX < -400 ? true : e.velocityX > 400 ? false : progress.value > 0.5;
          // eslint-disable-next-line react-hooks/immutability
          progress.value = withTiming(toCamera ? 1 : 0, { duration: 250 }, () => {
            if (!toCamera) armed.value = false;
            runOnJS(commit)(toCamera);
          });
        }),
    [armCamera, commit, progress, start, width, armed],
  );

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
      <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.body, color: wuzyColors.white, opacity: 0.7 }}>Scan to connect</Text>
    </>
  );

  const cameraSide = (
    <>
      <QrScanner />
      <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.body, color: wuzyColors.white, opacity: 0.7 }}>
        Point at another user&apos;s code
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
        <View style={{ paddingTop: wuzyLayout.top, paddingHorizontal: wuzyLayout.side, flexDirection: 'row', justifyContent: 'space-between' }}>
          <GlassNavButton icon="arrow-back" onPress={onBack} accessibilityLabel="Back" />
        </View>

        <View className="flex-1 items-center justify-center" style={{ paddingHorizontal: wuzyLayout.side }}>
          <GestureDetector gesture={pan}>
            <View
              className="overflow-hidden"
              style={{ width: '100%', maxWidth: 400, borderRadius: 24 }}
              onLayout={(e) => {
                setCardWidth(e.nativeEvent.layout.width);
                // eslint-disable-next-line react-hooks/immutability
                width.value = e.nativeEvent.layout.width;
              }}>
              {cardWidth > 0 && (
                <Animated.View style={[{ flexDirection: 'row', gap: SLIDE_GAP }, trackX]}>
                  <GlassPanel width={cardWidth}>
                    {connectTitle}
                    {qrSide}
                  </GlassPanel>
                  {showCamera && (
                    <GlassPanel width={cardWidth}>
                      {connectTitle}
                      {cameraSide}
                    </GlassPanel>
                  )}
                </Animated.View>
              )}
            </View>
          </GestureDetector>
        </View>
      </SafeAreaView>
    </View>
  );
}
