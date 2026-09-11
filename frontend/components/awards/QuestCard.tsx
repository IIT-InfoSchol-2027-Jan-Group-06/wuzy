import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, Pressable, Text, View, type ImageSourcePropType } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { questArtFor } from '@/constants/awards-data';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';
import { apiClaimQuest, type ApiQuest } from '@/lib/api';

type QuestCardProps = {
  quest: ApiQuest;
  actionLabel?: string;
  onAction?: () => void;
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
    <Animated.View style={[style, { position: 'absolute', width: size, height: size, borderRadius: size > 10 ? size / 2 : 2, backgroundColor: color }]} />
  );
}

/** A compact single task card: icon on the left, then the task title with a
 * progress bar and counter underneath, and on the right either a Claim button
 * (with a sparkle pop on press) when the task is complete, an action button
 * (Add / Share) while still in progress, or a Claimed badge once the reward
 * has been taken. */
export function QuestCard({ quest, actionLabel, onAction }: QuestCardProps) {
  const art: ImageSourcePropType | undefined = questArtFor(quest.name) ?? require('@/assets/badges/img1.png');

  const [claimed, setClaimed] = useState(quest.claimed);
  const [claiming, setClaiming] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const fraction = quest.target_count > 0 ? Math.min(1, quest.current_progress / quest.target_count) : 0;
  const barWidth = `${Math.round(fraction * 100)}%` as const;
  const complete = !claimed && quest.current_progress >= quest.target_count;

  const pop = useSharedValue(1);

  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  const handleClaim = async () => {
    if (claimed || claiming) return;
    setClaiming(true);
    setCelebrate(true);
    pop.value = withSequence(withSpring(1.2, { damping: 12, stiffness: 280 }), withSpring(1, { damping: 14, stiffness: 220 })); // eslint-disable-line react-hooks/immutability
    try {
      const updated = await apiClaimQuest(quest.id);
      await new Promise((resolve) => setTimeout(resolve, 750));
      setClaimed(updated.claimed);
    } catch {
      // Claim did not go through; drop the celebration and keep the button.
    } finally {
      setCelebrate(false);
      setClaiming(false);
    }
  };

  return (
    <View className="rounded-3xl bg-wuzy-surface p-4">
      <View className="flex-row items-center gap-[12px]">
        <View className="items-center justify-center" style={{ width: 48, height: 48 }}>
          <Image source={art} resizeMode="contain" style={{ width: 44, height: 44 }} />
        </View>

        <View className="flex-1">
          <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.semibold, fontSize: 15, color: wuzyColors.white }}>
            {quest.name}
          </Text>
          <View className="mt-[8px] h-[5px] overflow-hidden rounded-full bg-white/10">
            <View className="h-full rounded-full bg-wuzy-yellow" style={{ width: barWidth }} />
          </View>
          <Text numberOfLines={1} style={{ marginTop: 4, fontFamily: wuzyFonts.body, fontSize: 12, color: wuzyColors.gray }}>
            {quest.current_progress} / {quest.target_count} {quest.progress_unit}
          </Text>
        </View>

        {claimed ? (
          <View className="min-w-[70px] flex-row items-center justify-center gap-[5px] rounded-full border border-white/20 px-[16px] py-[8px]">
            <Ionicons name="checkmark-circle" size={14} color={wuzyColors.gray} />
            <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: 12, color: wuzyColors.gray }}>Claimed</Text>
          </View>
        ) : complete ? (
          <View className="relative">
            {celebrate && (
              <View pointerEvents="none" className="absolute" style={{ right: 24, top: -12, width: 0, height: 0 }}>
                {SPARKLE_SET.map((spark, i) => (
                  <SparklePiece key={i} {...spark} />
                ))}
              </View>
            )}
            <Animated.View style={popStyle}>
              <Pressable
                accessibilityRole="button"
                disabled={claiming}
                onPress={handleClaim}
                className="items-center justify-center rounded-full bg-wuzy-yellow active:opacity-80"
                style={{ paddingVertical: 8, paddingHorizontal: 16, ...(claiming ? { opacity: 0.7 } : {}) }}>
                <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: 13, color: wuzyColors.bg }}>
                  {claiming ? 'Claiming…' : 'Claim'}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        ) : actionLabel && onAction ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAction}
            className="items-center justify-center rounded-full border border-wuzy-yellow/40 active:opacity-80"
            style={{ paddingVertical: 8, paddingHorizontal: 16 }}>
            <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: 13, color: wuzyColors.yellow }}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}