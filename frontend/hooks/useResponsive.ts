import { useWindowDimensions } from 'react-native';

import { wuzyType } from '@/constants/wuzy-theme';

/**
 * Design width and font sizing. screenWidth is the window width, so ratios
 * scale with the actual screen.
 */
export function useResponsive() {
  const { width } = useWindowDimensions();
  const screenWidth = width;
  const fontSize = (ratio: keyof typeof wuzyType) => Math.round(screenWidth * wuzyType[ratio]);
  return { screenWidth, fontSize };
}
