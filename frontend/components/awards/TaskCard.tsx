import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions, type ImageSourcePropType } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';
import type { ApiTask } from '@/lib/api';

type TaskCardProps = {
  task: ApiTask;
  badge: ImageSourcePropType;
  statusText: string;
  actionLabel: string;
  onAction: () => void;
};

type ConfettiPieceProps = {
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
};

// Upward fan of confetti pieces, each with its own color, travel and stagger.
const CONFETTI = [
  { angle: 45, distance: 44, size: 7, color: '#FFE783', delay: 0 },
  { angle: 70, distance: 56, size: 6, color: '#FF4D8D', delay: 40 },
  { angle: 85, distance: 64, size: 5, color: '#8A5CF6', delay: 70 },
  { angle: 95, distance: 68, size: 6, color: '#FF9F43', delay: 30 },
  { angle: 110, distance: 58, size: 5, color: '#FFE783', delay: 80 },
  { angle: 130, distance: 46, size: 6, color: '#FF4D8D', delay: 50 },
  { angle: 60, distance: 34, size: 5, color: '#FF9F43', delay: 90 },
  { angle: 120, distance: 30, size: 7, color: '#8A5CF6', delay: 60 },
];

/** One confetti mote: flies outward at angle, spins, and fades. */
function ConfettiPiece({ angle, distance, size, color, delay }: ConfettiPieceProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 750, easing: Easing.out(Easing.cubic) }));
  }, [progress, delay]);

  const style = useAnimatedStyle(() => {
    const radians = (angle * Math.PI) / 180;
    return {
      opacity: 1 - progress.value,
      transform: [
        { translateX: Math.cos(radians) * distance * progress.value },
        { translateY: -Math.sin(radians) * distance * progress.value },
        { rotate: `${progress.value * 360}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[{ width: size, height: size, borderRadius: 2, backgroundColor: color }, style]} />
  );
}

function ConfettiBurst() {
  return (
    <View>
      {CONFETTI.map((piece, index) => (
        <ConfettiPiece key={index} {...piece} />
      ))}
    </View>
  );
}

/** One task row: badge image, title and progress grouped on the left, a fixed action button on the right. */
export function TaskCard({ task, badge, statusText, actionLabel, onAction }: TaskCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const titleSize = Math.round(screenWidth * (15 / 375));
  const statusSize = Math.round(screenWidth * (11 / 375));
  const actionSize = Math.round(screenWidth * (11 / 375));

  const isClaimable = task.status === 'CLAIMABLE';
  const isClaimed = task.status === 'CLAIMED';
  const ratio = task.target_progress > 0 ? Math.min(1, task.current_progress / task.target_progress) : 0;
  const progressPercent = `${Math.round(ratio * 100)}%` as const;

  // Claim button feels alive: a pulsing ring while claimable, a spring press,
  // and a confetti pop when the task flips to claimed.
  const pulse = useSharedValue(1);
  const press = useSharedValue(1);
  const pop = useSharedValue(1);
  const ring = useSharedValue(0);
  const wasClaimed = useRef(isClaimed);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    if (isClaimable && !isClaimed) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 700, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
      ring.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }), -1, true);
      return;
    }
    pulse.value = withTiming(1, { duration: 200 });
    ring.value = withTiming(0, { duration: 200 });
    if (!wasClaimed.current && isClaimed) {
      pop.value = withSequence(
        withSpring(1.18, { damping: 10, stiffness: 320 }),
        withSpring(1, { damping: 12, stiffness: 220 }),
      );
      timers = [
        setTimeout(() => setCelebrate(true), 40),
        setTimeout(() => setCelebrate(false), 1150),
      ];
    }
    wasClaimed.current = isClaimed;
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isClaimable, isClaimed, pulse, pop, ring]);

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value * press.value * pop.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(ring.value, [0, 1], [1, 1.4]) }],
    opacity: interpolate(ring.value, [0, 1], [0.9, 0]),
    borderWidth: 1.5,
    borderColor: wuzyColors.yellow,
  }));

  // The 3rd task badge renders a little smaller, centered inside the same 56px
  // slot so the row layout stays identical to the other tasks.
  const badgeNarrow = task.title === 'Connect with 10 Ravers';

  return (
    <View className="relative flex-row items-center justify-between gap-4 rounded-2xl bg-[#131927] p-4">
      <View className="flex-1 flex-row items-center gap-4">
        <View className="items-center justify-center" style={{ width: 56, height: 56 }}>
          <Image
            source={badge}
            resizeMode="contain"
            style={{ width: badgeNarrow ? 44 : 56, height: badgeNarrow ? 44 : 56 }}
          />
        </View>

        <View className="flex-1">
          <Text
            numberOfLines={1}
            style={{ fontFamily: wuzyFonts.medium, fontSize: titleSize, color: '#FFFFFF' }}>
            {task.title}
          </Text>
          <View className="mt-[7px] h-[5px] overflow-hidden rounded-full bg-white/10">
            <View
              className="h-full rounded-full bg-wuzy-yellow"
              style={{ width: progressPercent }}
            />
          </View>
          <Text
            style={{
              marginTop: 5,
              fontFamily: wuzyFonts.body,
              fontSize: statusSize,
              color: '#8E9BAE',
            }}>
            {statusText}
          </Text>
        </View>
      </View>

      <Animated.View style={[btnStyle, { alignSelf: 'center' }]}>
        {isClaimable && (
          <Animated.View
            pointerEvents="none"
            style={[ringStyle, StyleSheet.absoluteFill, { borderRadius: 999 }]}
          />
        )}
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          onPressIn={() => {
            press.value = withSpring(0.94, { damping: 16, stiffness: 280 });
          }}
          onPressOut={() => {
            press.value = withSpring(1, { damping: 14, stiffness: 240 });
          }}
          disabled={isClaimed}
          className={`min-w-[70px] items-center rounded-full px-[18px] py-[10px] ${
            isClaimable ? 'bg-wuzy-yellow' : isClaimed ? 'border border-white/20' : 'border border-wuzy-yellow/40'
          }`}>
          <Text
            style={{
              fontFamily: wuzyFonts.semibold,
              fontSize: actionSize,
              color: isClaimable ? '#0B0E14' : isClaimed ? '#8E9BAE' : '#FFE783',
            }}>
            {isClaimed ? 'Claimed' : isClaimable ? 'Claim' : actionLabel}
          </Text>
        </Pressable>
      </Animated.View>

      {celebrate && (
        <View pointerEvents="none" style={{ position: 'absolute', right: 54, top: '46%', zIndex: 10 }}>
          <ConfettiBurst />
        </View>
      )}
    </View>
  );
}