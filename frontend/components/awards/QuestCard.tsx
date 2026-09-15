import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';
import { apiClaimQuest, type ApiQuest } from '@/lib/api';

type QuestCardProps = {
  quest: ApiQuest;
  actionLabel?: string;
  onAction?: () => void;
  onClaimed?: () => void;
  onClaimCustom?: () => Promise<void>;
};

const SPARKLE_SET = [
  { angle: 50, distance: 48, size: 14, color: '#FFE783', delay: 0 },
  { angle: 72, distance: 58, size: 6, color: '#FF4D8D', delay: 60 },
  { angle: 95, distance: 64, size: 5, color: '#8A5CF6', delay: 90 },
  { angle: 112, distance: 54, size: 6, color: '#FF9F43', delay: 40 },
  { angle: 128, distance: 42, size: 14, color: '#FFE783', delay: 120 },
  { angle: 62, distance: 34, size: 5, color: '#8A5CF6', delay: 80 },
  { angle: 80, distance: 28, size: 5, color: '#FF4D8D', delay: 110 },
  { angle: 140, distance: 30, size: 6, color: '#FF9F43', delay: 50 },
];

/** One sparkle piece: flies outward at its angle, spins, and fades. */
function SparklePiece({
  angle,
  distance,
  size,
  color,
  delay,
}: {
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
  }, [progress, delay]);

  const style = useAnimatedStyle(() => {
    const rad = (angle * Math.PI) / 180;
    return {
      opacity: 1 - progress.value,
      transform: [
        { translateX: Math.cos(rad) * distance * progress.value },
        { translateY: -Math.sin(rad) * distance * progress.value },
        { rotate: `${progress.value * 240}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        style,
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size > 10 ? size / 2 : 2,
          backgroundColor: color,
        },
      ]}
    />
  );
}

/** A compact single task card: task title with a progress bar and counter, and
 * on the right either a Claim button (with a sparkle pop on press) when the
 * task is complete, an action button (Add / Share) while still in progress, or
 * a dimmed "All Done" card once every subtask has been claimed. Claiming
 * notifies the parent so it refetches and the card advances to the next
 * subtask. */
export function QuestCard({ quest, actionLabel, onAction, onClaimed, onClaimCustom }: QuestCardProps) {
  const sub = quest.active_subtask;
  const done = sub === null;

  const fraction = done ? 1 : Math.min(1, sub.current_progress / sub.target_count);
  const barWidth = `${Math.round(fraction * 100)}%` as const;

  const [celebrate, setCelebrate] = useState(false);
  const pop = useSharedValue(1);

  const popStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));

  const flashButton = () => {
    pop.value = withSequence(withSpring(1.12, { damping: 12, stiffness: 280 }), withSpring(1, { damping: 16, stiffness: 240 })); // eslint-disable-line react-hooks/immutability
  };

  const handleClaim = async () => {
    if (!sub || sub.current_progress < sub.target_count || celebrate) return;
    flashButton();
    setCelebrate(true);
    try {
      if (onClaimCustom) {
        await onClaimCustom();
      } else {
        await apiClaimQuest(quest.id);
      }
      setTimeout(() => {
        setCelebrate(false);
        onClaimed?.();
      }, 700);
    } catch {
      setCelebrate(false);
    }
  };

  const canClaim = sub !== null && sub.current_progress >= sub.target_count;

  return (
    <View className="rounded-3xl bg-wuzy-surface p-4" style={done ? { opacity: 0.5 } : undefined}>
      <View className="flex-row items-center gap-[12px]">
        <View className="flex-1">
          <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.semibold, fontSize: 15, color: done ? wuzyColors.gray : wuzyColors.white, textDecorationLine: done ? 'line-through' : 'none' }}>
            {quest.name}
          </Text>
          {!done && sub && (
            <Text numberOfLines={1} style={{ marginTop: 2, fontFamily: wuzyFonts.body, fontSize: 12, color: wuzyColors.yellow }}>
              {sub.name}
            </Text>
          )}

          <View className="mt-[8px] h-[24px] justify-center overflow-hidden rounded-full bg-white/10">
            <View className="absolute left-0 top-0 h-full rounded-full bg-wuzy-yellow" style={{ width: barWidth }} />
            <Text
              numberOfLines={1}
              className="text-center"
              style={{ fontFamily: wuzyFonts.semibold, fontSize: 11, color: done ? wuzyColors.gray : wuzyColors.white }}>
              {done
                ? 'All Done'
                : `${sub.current_progress} / ${sub.target_count} ${sub.progress_unit}`}
            </Text>
          </View>

          {!done && <StepIndicator step={quest.subtask_step} total={quest.subtask_total} />}
        </View>

        {done ? (
          <View className="min-w-[76px] items-center justify-center rounded-full border border-white/20 px-[16px] py-[8px]">
            <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: 12, color: wuzyColors.gray }}>All Done</Text>
          </View>
        ) : canClaim ? (
          <Animated.View style={popStyle}>
            <View className="rounded-full bg-wuzy-yellow px-[16px] py-[8px]">
              <Pressable onPress={handleClaim} accessibilityRole="button" className="items-center justify-center">
                <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: 13, color: wuzyColors.bg }}>Claim</Text>
              </Pressable>
            </View>
            {celebrate && (
              <View style={{ position: 'absolute', width: 0, height: 0, top: '50%', left: '50%' }}>
                {SPARKLE_SET.map((s, i) => (
                  <SparklePiece key={i} {...s} />
                ))}
              </View>
            )}
          </Animated.View>
        ) : onAction || onClaimCustom ? (
          <Animated.View style={popStyle}>
            <Pressable
              accessibilityRole="button"
              onPress={onAction ?? onClaimCustom}
              className="items-center justify-center rounded-full border border-wuzy-yellow/50 px-[16px] py-[8px] active:opacity-80">
              <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: 13, color: wuzyColors.yellow }}>
                {actionLabel ?? 'Claim'}
              </Text>
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <View className="mt-[6px] flex-row items-center gap-[5px]">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i + 1 === step ? 14 : 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i + 1 <= step ? wuzyColors.yellow : 'rgba(255,255,255,0.15)',
          }}
        />
      ))}
    </View>
  );
}