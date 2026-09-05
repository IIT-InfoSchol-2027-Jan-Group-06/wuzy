import { useWindowDimensions } from 'react-native';

import { wuzyType } from '@/constants/wuzy-theme';

// ponytail: only components/events/* use spacing(). Fold into px when those cards are redesigned.
export const spacingRatios = {
  xs: 0.01,
  sm: 0.02,
  md: 0.04,
  lg: 0.06,
  xl: 0.08,
} as const;

export function useResponsive() {
  const { width: screenWidth } = useWindowDimensions();

  const fontSize = (ratio: keyof typeof wuzyType) => Math.round(screenWidth * wuzyType[ratio]);
  const spacing = (ratio: keyof typeof spacingRatios) => Math.round(screenWidth * spacingRatios[ratio]);

  return { screenWidth, fontSize, spacing };
}
