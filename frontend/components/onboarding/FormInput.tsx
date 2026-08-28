import { TextInput, useWindowDimensions } from 'react-native';
import type { TextInputProps } from 'react-native';

import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

export function FormInput(props: TextInputProps) {
  const { width: screenWidth } = useWindowDimensions();

  return (
    <TextInput
      placeholderTextColor="#C0BDB2"
      autoCorrect={false}
      {...props}
      style={[
        {
          width: Math.round(screenWidth * 0.825),
          height: Math.round(screenWidth * 0.125),
          borderRadius: Math.round(screenWidth * 0.028),
          borderWidth: 1,
          borderColor: wuzyColors.yellow,
          backgroundColor: 'rgba(179, 175, 160, 0.1)',
          textAlign: 'center',
          color: wuzyColors.white,
          fontFamily: wuzyFonts.medium,
          fontSize: Math.round(screenWidth * 0.042),
        },
        props.style,
      ]}
    />
  );
}
