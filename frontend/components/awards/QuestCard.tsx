import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import type { ApiQuest } from '@/lib/api';

interface QuestCardProps {
  quest: ApiQuest;
  /** The right-hand pill while the tier is in progress. No onPress renders it disabled. */
  action?: { label: string; onPress?: () => void };
  claiming: boolean;
  onClaim: () => Promise<void>;
}

/** One unfinished quest: name, progress pill with the counter inside,
 * and on the right Claim (solid) or the action (outlined). */
export function QuestCard({ quest, action, claiming, onClaim }: QuestCardProps) {
  const tiers = quest.tiers;
  const index = quest.active_tier_index ?? tiers.length - 1;
  const tier = tiers[index];
  const fraction = Math.min(1, tier.current_progress / tier.target_count);

  const [note, setNote] = useState<string | null>(null);
  const pop = useSharedValue(1);

  useEffect(() => {
    if (!note) return;
    const timer = setTimeout(() => setNote(null), 2000);
    return () => clearTimeout(timer);
  }, [note]);

  useEffect(() => () => cancelAnimation(pop), [pop]);

  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  const handleClaim = async () => {
    if (!quest.claimable || claiming) return;
    try {
      await onClaim();
    } catch (error) {
      setNote(error instanceof Error ? error.message : 'Could not claim');
      return;
    }
    pop.value = withSequence(withSpring(1.12, { damping: 12, stiffness: 280 }), withSpring(1, { damping: 16, stiffness: 240 })); // eslint-disable-line react-hooks/immutability
  };

  let control;
  if (claiming) {
    control = <Pill variant="solid" loading />;
  } else if (quest.claimable) {
    control = <Pill variant="solid" label="Claim" onPress={handleClaim} />;
  } else if (action) {
    control = <Pill variant="outline" label={action.label} onPress={action.onPress} />;
  }

  return (
    <View className="rounded-3xl bg-wuzy-surface p-4">
      <View className="flex-row items-center" style={{ gap: wuzyLayout.itemGap }}>
        <View className="flex-1" style={{ gap: 4 }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: wuzyFonts.semibold,
              fontSize: wuzyType.body,
              color: wuzyColors.white,
            }}>
            {quest.name}
          </Text>
          <View className="justify-center overflow-hidden rounded-full bg-white/10" style={{ height: 24, marginTop: 4 }}>
            <View className="absolute left-0 top-0 h-full rounded-full bg-wuzy-yellow" style={{ width: `${Math.round(fraction * 100)}%` }} />
            <Text
              numberOfLines={1}
              className="text-center"
              style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.caption, color: wuzyColors.white }}>
              {tier.current_progress} / {tier.target_count} {tier.progress_unit}
            </Text>
          </View>

          {note ? (
            <Text numberOfLines={2} style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.caption, color: wuzyColors.yellow }}>
              {note}
            </Text>
          ) : null}
        </View>

        <Animated.View style={popStyle}>{control}</Animated.View>
      </View>
    </View>
  );
}

function Pill({
  variant,
  label,
  onPress,
  loading,
}: {
  variant: 'solid' | 'outline';
  label?: string;
  onPress?: () => void;
  loading?: boolean;
}) {
  const disabled = loading || !onPress;
  const className = variant === 'solid' ? 'bg-wuzy-yellow' : 'border border-wuzy-yellow/50';
  const color = variant === 'solid' ? wuzyColors.bg : wuzyColors.yellow;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`items-center justify-center rounded-full px-[16px] py-[8px] active:opacity-80 ${className}`}
      style={{ minWidth: 76, opacity: variant === 'outline' && !onPress ? 0.5 : 1 }}>
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color }}>{label}</Text>
      )}
    </Pressable>
  );
}
