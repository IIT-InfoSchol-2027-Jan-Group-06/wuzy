import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View, useWindowDimensions, type ImageSourcePropType } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { RANKS, RANK_SLOT, deckImage } from '@/constants/awards-data';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import type { ApiQuestDashboard } from '@/lib/api';

const COLUMNS = 5;
const TILE_GAP = 8;

interface StickerGridProps {
  dashboard: ApiQuestDashboard;
  previous: ApiQuestDashboard | null;
}

/** Which of the 15 deck slots the user has earned. */
function earnedSlots(d: ApiQuestDashboard): boolean[] {
  return d.deck.map((badgeId, slot) => {
    if (slot < RANK_SLOT) return d.quests.some((q) => q.completed && q.badge_id === badgeId);
    const rank = slot - RANK_SLOT;
    return rank < RANKS.length && rank <= d.xp.rank_index;
  });
}

function labelFor(d: ApiQuestDashboard, slot: number): string {
  const quest = d.quests.find((q) => q.badge_id === d.deck[slot]);
  if (quest) return quest.name;
  const rank = slot - RANK_SLOT;
  if (rank >= 0 && rank < RANKS.length) return `Rank reward: ${RANKS[rank]}`;
  return 'Coming soon';
}

/** The user's sticker collection in deck order: earned in colour, locked dimmed.
 * Tapping a tile names it under the grid; a newly earned tile springs in once. */
export function StickerGrid({ dashboard, previous }: StickerGridProps) {
  const { width } = useWindowDimensions();
  const tile = Math.floor((width - 2 * wuzyLayout.side - (COLUMNS - 1) * TILE_GAP) / COLUMNS);
  const [selected, setSelected] = useState<number | null>(null);

  const earned = earnedSlots(dashboard);
  const earnedBefore = previous ? earnedSlots(previous) : null;
  const count = earned.filter(Boolean).length;

  return (
    <View style={{ gap: wuzyLayout.itemGap }}>
      <View>
        <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.section, color: wuzyColors.yellow }}>
          Sticker Board
        </Text>
        <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.gray }}>
          {count} of {dashboard.deck.length} collected
        </Text>
      </View>
      <View className="flex-row flex-wrap" style={{ gap: TILE_GAP }}>
        {dashboard.deck.map((_, slot) => (
          <Tile
            key={slot}
            size={tile}
            image={deckImage(dashboard.deck, slot)}
            earned={earned[slot]}
            pop={earned[slot] && earnedBefore != null && !earnedBefore[slot]}
            selected={selected === slot}
            onPress={() => setSelected(slot)}
          />
        ))}
      </View>
      <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.small, color: wuzyColors.gray }}>
        {selected == null ? 'Tap a sticker' : labelFor(dashboard, selected)}
      </Text>
    </View>
  );
}

function Tile({
  size,
  image,
  earned,
  pop,
  selected,
  onPress,
}: {
  size: number;
  image: ImageSourcePropType;
  earned: boolean;
  pop: boolean;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (!pop) return;
    scale.value = 0.4;
    scale.value = withSpring(1, { damping: 10, stiffness: 160 });
    return () => cancelAnimation(scale);
  }, [pop, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }}>
      <Animated.View
        style={[
          {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: wuzyColors.surface,
            width: size,
            height: size,
            borderRadius: 16,
            padding: 6,
            borderWidth: 1,
            borderColor: selected ? wuzyColors.yellow : 'transparent',
          },
          style,
        ]}>
        <Image source={image} resizeMode="contain" style={{ width: '100%', height: '100%', opacity: earned ? 1 : 0.25 }} />
        {!earned && (
          <Ionicons
            name="lock-closed"
            size={12}
            color={wuzyColors.gray}
            style={{ position: 'absolute', right: 6, bottom: 6 }}
          />
        )}
      </Animated.View>
    </Pressable>
  );
}
