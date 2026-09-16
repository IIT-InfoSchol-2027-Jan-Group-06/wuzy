import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View, useWindowDimensions, type ImageSourcePropType } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

export interface CelebrationData {
  questName: string;
  tierName: string;
  xp: number;
  /** Set when the claim finished the quest and earned its badge. */
  badge?: ImageSourcePropType;
  /** Set when the claim crossed a rank threshold; plays as a second stage. */
  rankUp?: { rank: string; badge: ImageSourcePropType };
}

const BADGE = 200;
const CONFETTI_MS = 1400;
const PIECE_MS = 1200;
// Party-popper colours: the only place the app steps outside the yellow palette, on purpose.
const CONFETTI_COLORS = [wuzyColors.yellow, '#FF4D8D', '#8A5CF6', '#FF9F43', '#3ED6F0', wuzyColors.online, wuzyColors.white];

// ponytail: a tiny fixed-seed generator so the burst is identical every time and
// nothing random happens during render.
const rnd = (i: number, k: number) => ((i * 9301 + k * 49297 + 233) % 233280) / 233280;
// Every piece gets its own direction, speed and weight so the cloud is irregular.
const PIECES = Array.from({ length: 72 }, (_, i) => ({
  angle: rnd(i, 1) * Math.PI * 2,
  speed: 0.12 + rnd(i, 2) * 0.53,
  gravity: 0.6 + rnd(i, 7) * 0.8,
  w: 5 + Math.round(rnd(i, 3) * 7),
  h: 8 + Math.round(rnd(i, 4) * 8),
  round: i % 4 === 0,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: rnd(i, 5) * 150,
  spin: (rnd(i, 6) - 0.5) * 1440,
}));

/** Full-screen reward moment after a claim: headline, the badge or the XP, a
 * party popper from the centre, then "Tap to continue". A rank-up plays as a second stage. */
export function Celebration({ celebration, onClose }: { celebration: CelebrationData | null; onClose: () => void }) {
  const [stage, setStage] = useState<'claim' | 'rank'>('claim');

  const close = () => {
    setStage('claim');
    onClose();
  };
  const advance = () => {
    if (stage === 'claim' && celebration?.rankUp) setStage('rank');
    else close();
  };

  return (
    <Modal transparent visible={celebration !== null} animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={close}>
      {celebration && (
        <Pressable
          onPress={advance}
          accessibilityRole="button"
          accessibilityLabel="Continue"
          style={{ flex: 1, backgroundColor: 'rgba(10, 15, 23, 0.96)' }}>
          {stage === 'claim' ? (
            <Stage
              key="claim"
              headline={celebration.badge ? 'BADGE EARNED' : celebration.tierName.toUpperCase()}
              image={celebration.badge}
              xp={celebration.xp}
              line1={celebration.questName}
              line2={celebration.badge ? `${celebration.tierName} · +${celebration.xp} XP` : undefined}
            />
          ) : (
            <Stage key="rank" headline="RANK UP" image={celebration.rankUp?.badge} rank={celebration.rankUp?.rank} />
          )}
        </Pressable>
      )}
    </Modal>
  );
}

/** One stage's choreography. Remounting (a new key) resets every value. */
function Stage({
  headline,
  image,
  xp,
  line1,
  line2,
  rank,
}: {
  headline: string;
  image?: ImageSourcePropType;
  xp?: number;
  line1?: string;
  line2?: string;
  rank?: string;
}) {
  const reduceMotion = useReducedMotion();
  const { height } = useWindowDimensions();
  const headY = useSharedValue(24);
  const headO = useSharedValue(0);
  const badgeS = useSharedValue(0.4);
  const badgeO = useSharedValue(0);
  const clock = useSharedValue(0);
  const hintO = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      headY.value = 0;
      badgeS.value = 1;
      headO.value = withTiming(1, { duration: 200 });
      badgeO.value = withTiming(1, { duration: 200 });
      hintO.value = withDelay(300, withTiming(1, { duration: 200 }));
    } else {
      headY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.back(1.4)) });
      headO.value = withTiming(1, { duration: 250 });
      badgeS.value = withDelay(150, withSpring(1, { damping: 12, stiffness: 180 }));
      badgeO.value = withDelay(150, withTiming(1, { duration: 200 }));
      clock.value = withDelay(150, withTiming(1, { duration: CONFETTI_MS, easing: Easing.linear }));
      hintO.value = withDelay(
        1200,
        withSequence(
          withTiming(1, { duration: 300 }),
          withRepeat(withTiming(0.45, { duration: 800, easing: Easing.inOut(Easing.sin) }), -1, true),
        ),
      );
    }
    return () => {
      [headY, headO, badgeS, badgeO, clock, hintO].forEach(cancelAnimation);
    };
  }, [reduceMotion, headY, headO, badgeS, badgeO, clock, hintO]);

  const headStyle = useAnimatedStyle(() => ({ opacity: headO.value, transform: [{ translateY: headY.value }] }));
  const badgeStyle = useAnimatedStyle(() => ({ opacity: badgeO.value, transform: [{ scale: badgeS.value }] }));
  const hintStyle = useAnimatedStyle(() => ({ opacity: hintO.value }));

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: wuzyLayout.side, gap: wuzyLayout.gap }}>
      <Animated.Text
        style={[
          { fontFamily: wuzyFonts.display, fontSize: wuzyType.display, color: wuzyColors.yellow, textAlign: 'center' },
          headStyle,
        ]}>
        {headline}
      </Animated.Text>

      <View style={{ width: BADGE, height: BADGE, alignItems: 'center', justifyContent: 'center' }}>
        {image ? (
          <Animated.Image source={image} resizeMode="contain" style={[{ width: BADGE, height: BADGE }, badgeStyle]} />
        ) : (
          <Animated.Text style={[{ fontFamily: wuzyFonts.display, fontSize: wuzyType.hero, color: wuzyColors.yellow }, badgeStyle]}>
            +{xp} XP
          </Animated.Text>
        )}
      </View>

      <View style={{ alignItems: 'center', gap: 4 }}>
        {rank ? (
          <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.section, color: wuzyColors.yellow }}>{rank}</Text>
        ) : (
          <>
            <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body, color: wuzyColors.white, textAlign: 'center' }}>{line1}</Text>
            {line2 ? (
              <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.gray, textAlign: 'center' }}>
                {line2}
              </Text>
            ) : null}
          </>
        )}
      </View>

      <Animated.Text style={[{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.small, color: wuzyColors.gray }, hintStyle]}>
        Tap to continue
      </Animated.Text>

      {!reduceMotion && (
        <View pointerEvents="none" style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0 }}>
          {PIECES.map((piece, i) => (
            <Piece key={i} clock={clock} {...piece} speed={piece.speed * height} gravity={piece.gravity * height} />
          ))}
        </View>
      )}
    </View>
  );
}

/** One confetti piece: bursts out fast, drag slows it, gravity pulls it down, it spins and fades late. */
function Piece({
  clock,
  angle,
  speed,
  gravity,
  w,
  h,
  round,
  color,
  delay,
  spin,
}: {
  clock: SharedValue<number>;
  angle: number;
  speed: number;
  gravity: number;
  w: number;
  h: number;
  round: boolean;
  color: string;
  delay: number;
  spin: number;
}) {
  const style = useAnimatedStyle(() => {
    const t = Math.min(1, Math.max(0, (clock.value * CONFETTI_MS - delay) / PIECE_MS));
    const eased = 1 - (1 - t) * (1 - t) * (1 - t);
    return {
      opacity: t === 0 ? 0 : t < 0.6 ? 1 : (1 - t) / 0.4,
      transform: [
        { translateX: Math.cos(angle) * speed * eased },
        { translateY: Math.sin(angle) * speed * eased + gravity * t * t },
        { rotate: `${spin * t}deg` },
      ],
    };
  });
  return (
    <Animated.View
      style={[{ position: 'absolute', width: w, height: h, borderRadius: round ? w / 2 : 1, backgroundColor: color }, style]}
    />
  );
}
