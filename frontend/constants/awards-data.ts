import type { ImageSourcePropType } from 'react-native';

// Local sticker art for the Awards sticker board, keyed by quest name. The
// backend never knows about these PNGs; they are the design's artwork.
export const questArt: Record<string, ImageSourcePropType> = {
  'Attend Live Events': require('@/assets/badges/img15.png'),
  'Social Network': require('@/assets/badges/img9.png'),
  'Ticket Sharing': require('@/assets/badges/img13.png'),
  'Daily Login': require('@/assets/badges/img10.png'),
  'Purchase Ticket': require('@/assets/badges/img11.png'),
  'Complete Profile': require('@/assets/badges/img14.png'),
};

export function questArtFor(name: string): ImageSourcePropType | undefined {
  return questArt[name];
}