import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';

import { deckImage, earnedSlots, slotLabel } from '@/constants/awards-data';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import type { ApiQuestDashboard } from '@/lib/api';

const COLUMNS = 5;
const TILE_GAP = 8;

/** The user's sticker collection in deck order: earned in colour, locked dimmed.
 * Tapping a tile names it under the grid. */
export function StickerGrid({ dashboard }: { dashboard: ApiQuestDashboard }) {
  const { width } = useWindowDimensions();
  const tile = Math.floor((width - 2 * wuzyLayout.side - (COLUMNS - 1) * TILE_GAP) / COLUMNS);
  const [selected, setSelected] = useState<number | null>(null);
  const earned = earnedSlots(dashboard);
  const count = earned.filter(Boolean).length;

  return (
    <View style={{ gap: wuzyLayout.itemGap }}>
      <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.gray }}>
        {count} of {dashboard.deck.length} collected
      </Text>
      <View className="flex-row flex-wrap" style={{ gap: TILE_GAP }}>
        {dashboard.deck.map((_, slot) => (
          <Pressable
            key={slot}
            onPress={() => setSelected(slot)}
            accessibilityRole="button"
            accessibilityLabel={slotLabel(dashboard, slot)}
            accessibilityState={{ selected: selected === slot }}
            className="items-center justify-center bg-wuzy-surface"
            style={{
              width: tile,
              height: tile,
              borderRadius: 16,
              padding: 6,
              borderWidth: 1,
              borderColor: selected === slot ? wuzyColors.yellow : 'transparent',
            }}>
            <Image
              source={deckImage(dashboard.deck, slot)}
              resizeMode="contain"
              style={{ width: '100%', height: '100%', opacity: earned[slot] ? 1 : 0.25 }}
            />
            {!earned[slot] && (
              <Ionicons name="lock-closed" size={12} color={wuzyColors.gray} style={{ position: 'absolute', right: 6, bottom: 6 }} />
            )}
          </Pressable>
        ))}
      </View>
      <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.small, color: wuzyColors.gray }}>
        {selected == null ? 'Tap a sticker' : slotLabel(dashboard, selected)}
      </Text>
    </View>
  );
}
