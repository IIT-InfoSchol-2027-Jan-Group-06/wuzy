import { Text, TextInput, View } from 'react-native';

import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';
import { useResponsive } from '@/hooks/useResponsive';

export interface LabeledInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

/** A single dark card holding a gold bold label on top and a white input below. */
export function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  autoCapitalize = 'sentences',
}: LabeledInputProps) {
  const { screenWidth } = useResponsive();

  const labelFontSize = Math.round(screenWidth * 0.028);
  const inputFontSize = Math.round(screenWidth * 0.034);
  const singleLineHeight = Math.round(screenWidth * 0.055);
  const multilineHeight = Math.round(screenWidth * 0.26);

  return (
    <View style={{ backgroundColor: '#2B2D24', borderRadius: 16, padding: 16, gap: 8 }}>
      <Text
        style={{
          fontFamily: wuzyFonts.bold,
          fontSize: labelFontSize,
          color: '#CCBB73',
        }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={wuzyColors.gray}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        textAlignVertical={multiline ? 'top' : 'center'}
        selectionColor="#FFE783"
        underlineColorAndroid="transparent"
        style={{
          fontFamily: wuzyFonts.body,
          fontSize: inputFontSize,
          color: '#FFFFFF',
          padding: 0,
          minHeight: multiline ? multilineHeight : singleLineHeight,
        }}
      />
    </View>
  );
}