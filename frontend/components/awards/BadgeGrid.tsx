import { BlurView } from 'expo-blur';
import { useMemo } from 'react';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { questArtFor } from '@/constants/awards-data';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

// Seeded tilt. The placement itself is fixed: stickers cluster in the middle
// of the box, spread out from its center point.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Placement = { left: number; top: number; size: number; rot: number; z: number };

// Stickers sit in the middle of the board, spread horizontally around the
// center point (50, 50), tilted a little so they still read as stickers
// rather than a rigid grid row.
function centeredPlacements(seed: number, count: number): Placement[] {
  const rand = mulberry32(seed);
  const spots: Placement[] = [];
  for (let i = 0; i < count; i += 1) {
    const spread = (i - (count - 1) / 2) * 27;
    const jitter = (rand() - 0.5) * 6;
    spots.push({
      left: 50 + spread + jitter,
      top: 50 + (rand() - 0.5) * 12,
      size: 100 + Math.round(rand() * 30),
      rot: Math.round((rand() * 16 - 8) * 10) / 10,
      z: 5 + Math.floor(rand() * 10),
    });
  }
  return spots;
}

interface BadgeGridProps {
  earned: string[];
}

/** Sticker board: a sticker appears only for each fully completed task. */
export function BadgeGrid({ earned }: BadgeGridProps) {
  const art: ImageSourcePropType[] = useMemo(
    () => earned.map((name) => questArtFor(name)).filter((src): src is ImageSourcePropType => src !== undefined),
    [earned],
  );

  const placements = useMemo(() => centeredPlacements(42, art.length), [art.length]);

  return (
    <View
      className="overflow-hidden rounded-3xl border border-[#FFE783]/20 bg-[#FFE783]/10"
      style={{ height: 320, maxHeight: 320 }}>
      <BlurView intensity={40} tint="dark" pointerEvents="none" style={StyleSheet.absoluteFill} />
      {art.length === 0 ? (
        <View className="flex-1 items-center justify-center" style={{ paddingHorizontal: 24 }}>
          <Text
            className="text-center"
            style={{ fontFamily: wuzyFonts.semibold, fontSize: 13, color: wuzyColors.yellowMuted }}>
            Complete a task to earn its badge
          </Text>
        </View>
      ) : (
        art.map((src, index) => {
          const spot = placements[index];
          return (
            <Image
              key={index}
              source={src}
              resizeMode="contain"
              style={{
                position: 'absolute',
                left: `${spot.left}%`,
                top: `${spot.top}%`,
                width: spot.size,
                height: spot.size,
                zIndex: spot.z,
                transform: [
                  { translateX: -spot.size / 2 },
                  { translateY: -spot.size / 2 },
                  { rotate: `${spot.rot}deg` },
                ],
                shadowColor: '#000000',
                shadowOpacity: 0.3,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
              }}
            />
          );
        })
      )}
    </View>
  );
}