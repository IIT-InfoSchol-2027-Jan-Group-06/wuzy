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
const CONFETTI_MS = 2600;
// Party-popper colours: the only place the app steps outside the yellow palette, on purpose.
const CONFETTI_COLORS = [wuzyColors.yellow, '#FF4D8D', '#8A5CF6', '#FF9F43', '#3ED6F0', wuzyColors.online, wuzyColors.white];

// ponytail: a small integer hash so the burst is identical every run and nothing
// random happens during render. It must scramble, not step: a linear sequence
// here lines the pieces up on a spiral and the blast reads as a ring.
const rnd = (i: number, k: number) => {
  let x = (i * 374761393 + k * 668265263) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 1274126177) >>> 0;
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
};
// Each piece: its own direction, a speed skewed toward slow (most pieces stay
// near the centre, a few reach the edges), drag, weight, launch wave and life.
const PIECES = Array.from({ length: 180 }, (_, i) => ({
  angle: rnd(i, 1) * Math.PI * 2,
  speed: 0.25 + 0.75 * rnd(i, 2) ** 2,
  drag: 3 + rnd(i, 3) * 4,
  gravity: 0.25 + rnd(i, 4) * 0.35,
  delay: rnd(i, 5) * 450,
  life: 1300 + rnd(i, 6) * 800,
  wobbleAmp: 6 + rnd(i, 7) * 16,
  wobbleFreq: 4 + rnd(i, 8) * 5,
  tumbleFreq: 5 + rnd(i, 9) * 6,
  spin: (rnd(i, 10) - 0.5) * 1800,
  w: 5 + Math.round(rnd(i, 11) * 5),
  h: 7 + Math.round(rnd(i, 12) * 8),
  round: i % 5 === 0,
  color: CONFETTI_COLORS[Math.floor(rnd(i, 13) * CONFETTI_COLORS.length)],
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
        1400,
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

/** One confetti piece: a hard shove that drag bleeds off, then it flutters
 * sideways, tumbles, and gravity pulls it down while it fades late. */
function Piece({
  clock,
  angle,
  speed,
  drag,
  gravity,
  delay,
  life,
  wobbleAmp,
  wobbleFreq,
  tumbleFreq,
  spin,
  w,
  h,
  round,
  color,
}: (typeof PIECES)[number] & { clock: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const t = Math.min(1, Math.max(0, (clock.value * CONFETTI_MS - delay) / life));
    const travel = 1 - Math.exp(-drag * t);
    return {
      opacity: t === 0 ? 0 : t < 0.7 ? 1 : (1 - t) / 0.3,
      transform: [
        { translateX: Math.cos(angle) * speed * travel + Math.sin(t * wobbleFreq + angle) * wobbleAmp },
        { translateY: Math.sin(angle) * speed * travel + gravity * t * t },
        { rotate: `${spin * t}deg` },
        { scaleX: 0.35 + 0.65 * Math.abs(Math.cos(t * tumbleFreq)) },
      ],
    };
  });
  return (
    <Animated.View
      style={[{ position: 'absolute', width: w, height: h, borderRadius: round ? w / 2 : 1, backgroundColor: color }, style]}
    />
  );
}
