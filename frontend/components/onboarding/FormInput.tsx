import { Text, TextInput, type TextInputProps } from 'react-native';

import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

/** The outlined onboarding field: full width, control tall, yellow hairline, centered text. */
export function FormInput({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#C0BDB2"
      autoCorrect={false}
      {...props}
      style={[
        {
          width: '100%',
          height: wuzyLayout.control,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: wuzyColors.yellow,
          backgroundColor: 'rgba(179, 175, 160, 0.1)',
          textAlign: 'center',
          color: wuzyColors.white,
          fontFamily: wuzyFonts.medium,
          fontSize: wuzyType.body,
          paddingVertical: 0,
        },
        style,
      ]}
    />
  );
}

/** Inline validation or server error under a field. Renders nothing when there is no message. */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <Text style={{ textAlign: 'center', fontFamily: wuzyFonts.medium, fontSize: wuzyType.small, color: wuzyColors.yellow }}>
      {message}
    </Text>
  );
}
