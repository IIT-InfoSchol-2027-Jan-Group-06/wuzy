import { BlurView } from 'expo-blur';
import { useMemo } from 'react';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { questArtFor } from '@/constants/awards-data';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

// Seeded random scatter. Stickers land in the middle of the box (never near
// corners) and never physically overlap. The box stays a fixed 200px height.
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

// Random scatter across the whole box: stickers are thrown anywhere inside the
// margins (not clustered in the middle), so it reads as a fun board rather
// than a grid. Overlaps are rejected, so all stickers always land.
function randomScatter(seed: number, count: number, boxW: number, boxH: number): Placement[] {
  const rand = mulberry32(seed);
  const spots: Placement[] = [];
  const taken: { x: number; y: number; size: number }[] = [];
  const fits = (x: number, y: number, size: number) =>
    !taken.some((t) => {
      const dx = x - t.x;
      const dy = y - t.y;
      const min = (size + t.size) / 2 + 2;
      return dx * dx + dy * dy < min * min;
    });
  const push = (left: number, top: number, size: number) => {
    taken.push({ x: (left / 100) * boxW, y: (top / 100) * boxH, size });
    spots.push({
      left,
      top,
      size,
      rot: Math.round((rand() * 24 - 12) * 10) / 10,
      z: 5 + Math.floor(rand() * 26),
    });
  };

  let guard = 0;
  while (spots.length < count && guard < 4000) {
    guard += 1;
    const size = 52 + Math.round(rand() * 10);
    const left = 16 + rand() * 68;
    const top = 20 + rand() * 60;
    if (!fits((left / 100) * boxW, (top / 100) * boxH, size)) continue;
    push(left, top, size);
  }
  return spots;
}

const BOARD_WIDTH = 320;
const BOARD_HEIGHT = 200;

interface BadgeGridProps {
  earned: string[];
}

/** Sticker board: a sticker appears only for each fully completed task. */
export function BadgeGrid({ earned }: BadgeGridProps) {
  const art: ImageSourcePropType[] = useMemo(
    () => earned.map((name) => questArtFor(name)).filter((src): src is ImageSourcePropType => src !== undefined),
    [earned],
  );

  const placements = useMemo(
    () => randomScatter(42, art.length, BOARD_WIDTH, BOARD_HEIGHT),
    [art.length],
  );

  return (
    <View
      className="overflow-hidden rounded-3xl border border-[#FFE783]/20 bg-[#FFE783]/10"
      style={{ height: 200, maxHeight: 200 }}>
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