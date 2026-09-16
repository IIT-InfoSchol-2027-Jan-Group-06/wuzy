import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import type { ApiQuest } from '@/lib/api';

// Dark text on the yellow claimable card, one step softer than bg for the second line.
const ON_YELLOW_SOFT = 'rgba(10, 15, 23, 0.7)';

interface QuestCardProps {
  quest: ApiQuest;
  /** The right-hand pill while the tier is in progress. No onPress renders it disabled. */
  action?: { label: string; onPress?: () => void };
  claiming: boolean;
  onClaim: () => Promise<void>;
}

/** One unfinished quest. In progress: surface card with the name, the progress
 * pill and an outlined action pill. Claimable: the whole card turns yellow and
 * becomes the button. */
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
    pop.value = withSequence(withSpring(1.04, { damping: 12, stiffness: 280 }), withSpring(1, { damping: 16, stiffness: 240 })); // eslint-disable-line react-hooks/immutability
  };

  if (quest.claimable) {
    return (
      <Animated.View style={popStyle}>
        <Pressable
          onPress={handleClaim}
          disabled={claiming}
          accessibilityRole="button"
          accessibilityLabel={`Claim ${quest.name}`}
          className="flex-row items-center rounded-3xl p-4 active:opacity-90"
          style={{ backgroundColor: wuzyColors.yellow, gap: wuzyLayout.itemGap }}>
          <View className="flex-1" style={{ gap: 4 }}>
            <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body, color: wuzyColors.bg }}>
              {quest.name}
            </Text>
            {claiming ? (
              <ActivityIndicator size="small" color={wuzyColors.bg} style={{ alignSelf: 'flex-start' }} />
            ) : (
              <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.small, color: ON_YELLOW_SOFT }}>
                Tap to claim · +{tier.reward_xp} XP
              </Text>
            )}
            {note ? (
              <Text numberOfLines={2} style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.caption, color: wuzyColors.bg }}>
                {note}
              </Text>
            ) : null}
          </View>
          <Ionicons name="sparkles" size={20} color={wuzyColors.bg} />
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View className="rounded-3xl bg-wuzy-surface p-4">
      <View className="flex-row items-center" style={{ gap: wuzyLayout.itemGap }}>
        <View className="flex-1" style={{ gap: 4 }}>
          <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body, color: wuzyColors.white }}>
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
        </View>

        {action && (
          <Pressable
            onPress={action.onPress}
            disabled={!action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            className="items-center justify-center rounded-full border border-wuzy-yellow/50 px-[16px] py-[8px] active:opacity-80"
            style={{ minWidth: 76, opacity: action.onPress ? 1 : 0.5 }}>
            <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.yellow }}>{action.label}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
