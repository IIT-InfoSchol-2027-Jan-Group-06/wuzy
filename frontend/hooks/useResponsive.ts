import { useWindowDimensions } from 'react-native';

import { wuzyType } from '@/constants/wuzy-theme';

/** Font sizes scale with screen width: fontSize('body') is screenWidth * wuzyType.body, rounded. */
export function useResponsive() {
  const { width: screenWidth } = useWindowDimensions();
  const fontSize = (ratio: keyof typeof wuzyType) => Math.round(screenWidth * wuzyType[ratio]);
  return { screenWidth, fontSize };
}
