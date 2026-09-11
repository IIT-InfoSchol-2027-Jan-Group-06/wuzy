import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
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

import { questArtFor } from '@/constants/awards-data';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';
import type { ApiQuest, ApiQuestLevel } from '@/lib/api';

type QuestCardProps = {
  quest: ApiQuest;
  actionLabel?: string;
  /** When false the header action is dimmed and unfireable (e.g. Claim before a step is complete). */
  actionEnabled?: boolean;
  onAction?: () => void;
  onClaim: (level: ApiQuestLevel) => Promise<void>;
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

/** Reward line: badge name, XP, and sticker label, joined with dots. */
function rewardText(level: ApiQuestLevel): string {
  return [
    level.reward_name,
    level.reward_xp > 0 ? `+${level.reward_xp} XP` : null,
    level.reward_sticker ? 'Exclusive Sticker' : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** The pulsing yellow Claim pill with a confetti pop on claim. Only exists
 * for a completed level, so it is mounted solely to be pressed. */
function ClaimButton({
  level,
  onClaim,
}: {
  level: ApiQuestLevel;
  onClaim: (level: ApiQuestLevel) => Promise<void>;
}) {
  const [celebrate, setCelebrate] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const pulse = useSharedValue(1);
  const press = useSharedValue(1);
  const ring = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    ring.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => {
      pulse.value = withTiming(1, { duration: 200 });
      ring.value = withTiming(0, { duration: 200 });
    };
  }, [pulse, ring]);

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value * press.value }],
    opacity: claiming ? 0.7 : 1,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(ring.value, [0, 1], [1, 1.4]) }],
    opacity: interpolate(ring.value, [0, 1], [0.9, 0]),
    borderWidth: 1.5,
    borderColor: wuzyColors.yellow,
  }));

  const handleClaimPress = async () => {
    if (claiming) return;
    setClaiming(true);
    try {
      await onClaim(level);
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 1150);
    } catch {
      // Claim did not go through; the row keeps its current state.
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={10}
      onPress={handleClaimPress}
      onPressIn={() => {
        press.value = withSpring(0.94, { damping: 16, stiffness: 280 });
      }}
      onPressOut={() => {
        press.value = withSpring(1, { damping: 14, stiffness: 240 });
      }}
      style={[btnStyle, { alignSelf: 'center' }]}
      className="relative min-w-[70px] items-center rounded-full bg-wuzy-yellow px-[18px] py-[10px]">
      <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: 12, color: '#0B0E14' }}>Claim</Text>
      <Animated.View pointerEvents="none" style={[ringStyle, StyleSheet.absoluteFill, { borderRadius: 999 }]} />
      {celebrate && (
        <View pointerEvents="none" style={{ position: 'absolute', right: 46, top: '50%', zIndex: 10 }}>
          <ConfettiBurst />
        </View>
      )}
    </Pressable>
  );
}

/** One sub-task row: goal and reward on the left, a status control on the
 * right (next progress, Claim when done, or Claimed after the award is taken). */
function QuestStepRow({
  quest,
  level,
  onClaim,
}: {
  quest: ApiQuest;
  level: ApiQuestLevel;
  onClaim: (level: ApiQuestLevel) => Promise<void>;
}) {
  const claimed = level.status === 'CLAIMED';

  return (
    <View className="flex-row items-center gap-[12px]" style={claimed ? { opacity: 0.6 } : undefined}>
      <View className="flex-1">
        <Text
          numberOfLines={1}
          style={{ fontFamily: wuzyFonts.medium, fontSize: 14, color: claimed ? wuzyColors.gray : wuzyColors.white }}>
          {level.goal_text}
        </Text>
        <Text numberOfLines={1} style={{ marginTop: 2, fontFamily: wuzyFonts.body, fontSize: 12, color: wuzyColors.gray }}>
          {rewardText(level)}
        </Text>
      </View>

      {claimed && (
        <View className="min-w-[70px] flex-row items-center justify-center gap-[5px] rounded-full border border-white/20 px-[18px] py-[10px]">
          <Ionicons name="checkmark-circle" size={14} color={wuzyColors.gray} />
          <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: 12, color: wuzyColors.gray }}>Claimed</Text>
        </View>
      )}

      {level.status === 'COMPLETED' && <ClaimButton level={level} onClaim={onClaim} />}

      {level.status === 'UNLOCKED' && (
        <View className="min-w-[70px] items-center rounded-full border border-wuzy-yellow/40 bg-wuzy-yellow/10 px-[18px] py-[10px]">
          <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: 12, color: wuzyColors.yellow }}>
            {quest.current_progress} / {level.target_count}
          </Text>
        </View>
      )}
    </View>
  );
}

/** A quest chain card: header with art and progress, then the chain's steps.
 * Steps reveal one at a time: the next becomes visible only after the award
 * before it is claimed, so users keep working toward the next reward. */
export function QuestCard({ quest, actionLabel, actionEnabled, onAction, onClaim }: QuestCardProps) {
  const art: ImageSourcePropType | undefined = questArtFor(quest.name) ?? require('@/assets/badges/img1.png');

  // Progress bar fills as steps are finished: each claimed step owns a full
  // segment, and the step in progress earns partial credit toward its segment,
  // so the bar only ever grows across the whole chain.
  const activeIndex = quest.levels.findIndex((level) => level.status !== 'CLAIMED');
  const totalLevels = quest.levels.length;
  const claimedCount = activeIndex === -1 ? totalLevels : activeIndex;
  let partial = 0;
  if (activeIndex !== -1) {
    const activeLevel = quest.levels[activeIndex];
    const prevTarget = activeIndex > 0 ? quest.levels[activeIndex - 1].target_count : 0;
    const span = activeLevel.target_count - prevTarget;
    if (span > 0) {
      partial = Math.max(0, Math.min(1, (quest.current_progress - prevTarget) / span));
    }
  }
  const overall = totalLevels > 0 ? (claimedCount + partial) / totalLevels : 0;
  const progressPercent = `${Math.round(overall * 100)}%` as const;

  const visibleLevels = activeIndex === -1 ? quest.levels : quest.levels.slice(0, activeIndex + 1);
  const activeLevel = activeIndex === -1 ? quest.levels[quest.levels.length - 1] : quest.levels[activeIndex];
  const activeTarget = activeLevel?.target_count ?? 0;

  return (
    <View className="rounded-3xl bg-wuzy-surface p-4">
      <View className="flex-row items-center gap-[14px]">
        <View className="items-center justify-center" style={{ width: 56, height: 56 }}>
          <Image source={art} resizeMode="contain" style={{ width: 52, height: 52 }} />
        </View>
        <View className="flex-1">
          <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.semibold, fontSize: 16, color: wuzyColors.white }}>
            {quest.name}
          </Text>
          <Text numberOfLines={2} style={{ marginTop: 2, fontFamily: wuzyFonts.body, fontSize: 13, color: wuzyColors.gray }}>
            {quest.description}
          </Text>
        </View>
        {actionLabel && onAction && (
          <Pressable
            accessibilityRole="button"
            disabled={actionEnabled === false}
            onPress={onAction}
            className="rounded-full border border-wuzy-yellow/40 px-[16px] py-[8px] active:opacity-80"
            style={actionEnabled === false ? { opacity: 0.45 } : undefined}>
            <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: 13, color: wuzyColors.yellow }}>
              {actionLabel}
            </Text>
          </Pressable>
        )}
      </View>

      <View className="mt-[14px] h-[5px] overflow-hidden rounded-full bg-white/10">
        <View className="h-full rounded-full bg-wuzy-yellow" style={{ width: progressPercent }} />
      </View>
      <View className="mt-[6px] flex-row items-center justify-between">
        <Text style={{ fontFamily: wuzyFonts.body, fontSize: 12, color: wuzyColors.gray }}>
          {quest.current_progress} / {activeTarget}
        </Text>
        <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: 12, color: wuzyColors.yellow }}>
          {quest.total_xp} XP
        </Text>
      </View>

      <View className="mt-[14px] gap-[14px] border-t border-white/10 pt-[14px]">
        {visibleLevels.map((level) => (
          <QuestStepRow key={level.id} quest={quest} level={level} onClaim={onClaim} />
        ))}
      </View>
    </View>
  );
}