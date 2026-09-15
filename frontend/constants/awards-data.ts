import type { ImageSourcePropType } from 'react-native';

// All sticker art in the game, keyed by nothing: which image a user sees is
// decided per user. The backend never knows about these PNGs; they are the
// design's artwork.
export const BOARD_IMAGES: ImageSourcePropType[] = [
  require('@/assets/badges/img1.png'),
  require('@/assets/badges/img2.png'),
  require('@/assets/badges/img3.png'),
  require('@/assets/badges/img4.png'),
  require('@/assets/badges/img5.png'),
  require('@/assets/badges/img6.png'),
  require('@/assets/badges/img7.png'),
  require('@/assets/badges/img8.png'),
  require('@/assets/badges/img9.png'),
  require('@/assets/badges/img10.png'),
  require('@/assets/badges/img11.png'),
  require('@/assets/badges/img12.png'),
  require('@/assets/badges/img13.png'),
  require('@/assets/badges/img14.png'),
  require('@/assets/badges/img15.png'),
];

// Canonical slot order used to assign a quest/task name a sticker. Stable so
// every user gets the same names in the same order, just different art.
const AWARD_SLOT_ORDER = [
  'Daily Login',
  'Attend Live Events',
  'Social Network',
  'Purchase Ticket',
  'Complete Profile',
  'Ticket Sharing',
];

// Deterministic PRNG so a user's sticker deck is stable across app sessions.
function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], seed: number): T[] {
  const deck = [...items];
  const rand = mulberry32(seed ^ 0x9e3779b9);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/** The user's personal sticker deck: all 15 badges in their unique order. */
export function boardDeckFor(userId: number): ImageSourcePropType[] {
  return shuffle(BOARD_IMAGES, userId);
}

/** The sticker a specific user earns for a quest/task name, if the name has one. */
export function questArtForUser(
  userId: number,
  name: string,
): ImageSourcePropType | undefined {
  const deck = boardDeckFor(userId);
  const slot = AWARD_SLOT_ORDER.indexOf(name);
  if (slot < 0) return undefined;
  return deck[slot % deck.length];
}