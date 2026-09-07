import { BlurView } from 'expo-blur';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

// Badges must be transparent PNGs with no square frame baked into the file.
const badgeImages: ImageSourcePropType[] = [
  require('@/assets/badges/img15.png'),
  require('@/assets/badges/img14.png'),
  require('@/assets/badges/img13.png'),
  require('@/assets/badges/img12.png'),
  require('@/assets/badges/img11.png'),
  require('@/assets/badges/img10.png'),
  require('@/assets/badges/img9.png'),
  require('@/assets/badges/img8.png'),
  require('@/assets/badges/img7.png'),
  require('@/assets/badges/img6.png'),
  require('@/assets/badges/img5.png'),
  require('@/assets/badges/img4.png'),
  require('@/assets/badges/img3.png'),
  require('@/assets/badges/img2.png'),
  require('@/assets/badges/img1.png'),
];

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
// than a grid. Overlaps are rejected, and any sticker the random pass cannot
// fit gets placed on a gap-checked lattice sweep, so all 15 always land.
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

  // Random throw across the full box.
  let guard = 0;
  while (spots.length < count && guard < 4000) {
    guard += 1;
    const size = 40 + Math.round(rand() * 6);
    const left = 8 + rand() * 84;
    const top = 12 + rand() * 76;
    if (!fits((left / 100) * boxW, (top / 100) * boxH, size)) continue;
    push(left, top, size);
  }

  // Gap-checked lattice sweep for whatever the random pass could not fit.
  const stepPx = 52;
  const stepX = (stepPx / boxW) * 100;
  const stepY = (stepPx / boxH) * 100;
  const startX = 8 + rand() * stepX;
  const startY = 12 + rand() * stepY;
  for (let top = startY; top <= 88 - stepX && spots.length < count; top += stepY) {
    for (let left = startX; left <= 92 - stepX && spots.length < count; left += stepX) {
      const size = 40 + Math.round(rand() * 6);
      if (!fits((left / 100) * boxW, (top / 100) * boxH, size)) continue;
      push(left, top, size);
    }
  }
  return spots;
}

const STICKER_PLACEMENTS = randomScatter(42, 15, 320, 200) as Placement[];

// Random scatter board: badges are absolutely placed around the center of the
// box with varied sizes, tilts and depth. Box dimensions are hardcoded.
export function BadgeGrid() {
  return (
    <View
      className="overflow-hidden rounded-3xl border border-[#FFE783]/20 bg-[#FFE783]/10"
      style={{ height: 200, maxHeight: 200 }}>
      <BlurView
        intensity={40}
        tint="dark"
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
      {badgeImages.map((src, index) => {
        const spot = STICKER_PLACEMENTS[index];
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
      })}
    </View>
  );
}