import { useWindowDimensions } from 'react-native';

import { wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

/**
 * Design width and font sizing. screenWidth is the window width capped at the widest
 * phone, so ratios stop growing on tablets and web.
 */
export function useResponsive() {
  const { width } = useWindowDimensions();
  const screenWidth = Math.min(width, wuzyLayout.maxWidth);
  const fontSize = (ratio: keyof typeof wuzyType) => Math.round(screenWidth * wuzyType[ratio]);
  return { screenWidth, fontSize };
}
