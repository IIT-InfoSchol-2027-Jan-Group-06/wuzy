import { useWindowDimensions } from 'react-native';

import { wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

/**
 * Design width and font sizing. screenWidth is the window width clamped to the phone
 * range, so ratios stop growing on tablets and web and stop shrinking on dense displays.
 */
export function useResponsive() {
  const { width } = useWindowDimensions();
  const screenWidth = Math.min(Math.max(width, wuzyLayout.minWidth), wuzyLayout.maxWidth);
  const fontSize = (ratio: keyof typeof wuzyType) => Math.round(screenWidth * wuzyType[ratio]);
  return { screenWidth, fontSize };
}
