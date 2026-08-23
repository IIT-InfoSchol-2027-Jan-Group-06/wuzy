import { useWindowDimensions } from 'react-native';

export const fontRatios = {
  display: 0.10,
  title: 0.10,
  sectionTitle: 0.045,
  body: 0.035,
  tag: 0.032,
  button: 0.028,
  caption: 0.025,
  tiny: 0.022,
} as const;

export const spacingRatios = {
  xs: 0.01,
  sm: 0.02,
  md: 0.04,
  lg: 0.06,
  xl: 0.08,
} as const;

export function useResponsive() {
  const { width: screenWidth } = useWindowDimensions();

  const fontSize = (ratio: keyof typeof fontRatios) => Math.round(screenWidth * fontRatios[ratio]);
  const spacing = (ratio: keyof typeof spacingRatios) => Math.round(screenWidth * spacingRatios[ratio]);

  return { screenWidth, fontSize, spacing, fontRatios, spacingRatios };
}