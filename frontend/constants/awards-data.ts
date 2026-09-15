import type { ImageSourcePropType } from 'react-native';

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

/** The board's sticker art in the user's personal deck order (badge ids). */
export function deckImages(deck: number[]): ImageSourcePropType[] {
  return deck.map((id) => badgeImage(id) ?? BOARD_IMAGES[0]);
}

/** The badge a user earned for a task, looked up through their persisted awards. */
export function badgeImageForAward(
  awards: readonly { award_type: string; badge_id: number | null }[],
  name: string,
): ImageSourcePropType | undefined {
  let type = name;
  if (name === 'Purchase Ticket') type = 'ticket_purchase';
  else if (name === 'Complete Profile') type = 'profile_complete';
  return badgeImage(awards.find((a) => a.award_type === type)?.badge_id);
}