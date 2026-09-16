import type { ImageSourcePropType } from 'react-native';

import type { ApiAwardRead, ApiQuestDashboard } from '@/lib/api';

// All sticker art in the game. The backend stores only badge ids (1..15);
// this array maps a badge id to its artwork. Which id a user earns for a
// given task is decided by their persisted personal badge deck.
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

/** The artwork for a stored badge id, or undefined when the id is out of range. */
export function badgeImage(badgeId: number | null | undefined): ImageSourcePropType | undefined {
  if (badgeId == null || badgeId < 1 || badgeId > BOARD_IMAGES.length) return undefined;
  return BOARD_IMAGES[badgeId - 1];
}

/** The art in a deck slot, falling back to the first sticker for a bad id. */
export function deckImage(deck: number[], slot: number): ImageSourcePropType {
  return badgeImage(deck[slot]) ?? BOARD_IMAGES[0];
}

export const RANKS = ['Bronze', 'Silver', 'Gold', 'Diamond'] as const;

/** Deck slots 10..13 hold the four ranks' art; 0..9 belong to quests. */
export const RANK_SLOT = 10;

/** Which of the deck's slots the user has earned: quest slots by a completed
 * quest's badge, rank slots by the rank reached. Slots past both are never earned. */
export function earnedSlots(d: ApiQuestDashboard): boolean[] {
  return d.deck.map((badgeId, slot) => {
    if (slot < RANK_SLOT) return d.quests.some((q) => q.completed && q.badge_id === badgeId);
    const rank = slot - RANK_SLOT;
    return rank < RANKS.length && rank <= d.xp.rank_index;
  });
}

/** What a deck slot is for: the quest name, the rank it rewards, or a placeholder. */
export function slotLabel(d: ApiQuestDashboard, slot: number): string {
  const quest = d.quests.find((q) => q.badge_id === d.deck[slot]);
  if (quest) return quest.name;
  const rank = slot - RANK_SLOT;
  if (rank >= 0 && rank < RANKS.length) return `Rank reward: ${RANKS[rank]}`;
  return 'Coming soon';
}

/** Stickers a profile shows: every award row that carried a badge, oldest first. */
export function earnedStickers(
  awards: readonly ApiAwardRead[],
): { name: string; image: ImageSourcePropType }[] {
  return [...awards]
    .filter((a) => a.badge_id != null)
    .sort((a, b) => a.awarded_at.localeCompare(b.awarded_at))
    .flatMap((a) => {
      const image = badgeImage(a.badge_id);
      return image ? [{ name: a.award_type, image }] : [];
    });
}
