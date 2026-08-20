import { StyleProp, Text, TextStyle } from 'react-native';

import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

type EventTitleProps = {
  title: string;
  size?: number;
  color?: string;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
};

export function EventTitle({
  title,
  size = 15,
  color = wuzyColors.white,
  numberOfLines = 1,
  style,
}: EventTitleProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      className="flex-1"
      style={[{ fontFamily: wuzyFonts.bold, fontSize: size, color }, style]}>
      {title}
    </Text>
  );
}