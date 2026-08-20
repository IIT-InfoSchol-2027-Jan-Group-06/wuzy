import { StyleProp, Text, View, ViewStyle } from 'react-native';

import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

type DateBadgeProps = {
  date: string;
  month: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function DateBadge({
  date,
  month,
  size = 14,
  backgroundColor = 'rgba(255, 231, 131, 0.9)',
  textColor = wuzyColors.bg,
  style,
}: DateBadgeProps) {
  return (
    <View
      className="items-center rounded-[10px] px-[10px] py-[6px]"
      style={[{ backgroundColor }, style]}>
      <Text
        className="leading-[20px]"
        style={{ fontFamily: wuzyFonts.bold, fontSize: size, color: textColor }}>
        {date}
      </Text>
      <Text
        className="leading-[12px]"
        style={{
          fontFamily: wuzyFonts.semibold,
          fontSize: size * 0.55,
          color: textColor,
        }}>
        {month}
      </Text>
    </View>
  );
}