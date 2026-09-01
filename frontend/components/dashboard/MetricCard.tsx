import { Text, View, useWindowDimensions } from 'react-native';

import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

type MetricCardProps = {
  label: string;
  value: string;
};

/** Compact stat card: gold label over a large white numeric value. */
export function MetricCard({ label, value }: MetricCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const radius = Math.round(screenWidth * 0.035);
  const pad = Math.round(screenWidth * 0.045);
  const labelSize = Math.round(screenWidth * 0.03);
  const valueSize = Math.round(screenWidth * 0.09);

  return (
    <View
      className="flex-1 items-center"
      style={{ backgroundColor: '#2A2D24', borderRadius: radius, padding: pad }}>
      <Text
        numberOfLines={2}
        style={{ color: wuzyColors.yellow, fontFamily: wuzyFonts.medium, fontSize: labelSize }}>
        {label}
      </Text>
      <Text
        style={{
          color: wuzyColors.white,
          fontFamily: wuzyFonts.bold,
          fontSize: valueSize,
          marginTop: Math.round(screenWidth * 0.012),
        }}>
        {value}
      </Text>
    </View>
  );
}
