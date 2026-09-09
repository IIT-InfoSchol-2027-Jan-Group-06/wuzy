import type { ImageSourcePropType } from 'react-native';

// Local sticker art for each backend task, keyed by task title. The backend
// only stores an image path; these bundled PNGs are the design's artwork.
export const taskBadgeArt: Record<string, ImageSourcePropType> = {
  'Attend 3 Live Events': require('@/assets/badges/img15.png'),
  'Connect with 10 Ravers': require('@/assets/badges/img9.png'),
  'Share an Event Ticket': require('@/assets/badges/img13.png'),
};

export function taskBadgeArtFor(title: string): ImageSourcePropType | undefined {
  return taskBadgeArt[title];
}