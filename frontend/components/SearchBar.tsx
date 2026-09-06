import { Ionicons } from '@expo/vector-icons';
import { Pressable, TextInput, View } from 'react-native';
import { useState } from 'react';

import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';
import { useResponsive } from '@/hooks/useResponsive';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSearchSubmit?: () => void;
  onClear?: () => void;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search', onSearchSubmit, onClear }: SearchBarProps) {
  const { fontSize } = useResponsive();
  const [localValue, setLocalValue] = useState(value ?? '');

  // Adjust local state during render when the controlled value changes (React's documented pattern).
  const [prevValue, setPrevValue] = useState(value ?? '');
  if (value !== prevValue) {
    setPrevValue(value);
    setLocalValue(value ?? '');
  }

  const handleClear = () => {
    setLocalValue('');
    onChangeText('');
    onClear?.();
  };

  return (
    <View
      collapsable={false}
      className="w-full flex-row items-center rounded-full px-[16px]"
      style={{ backgroundColor: wuzyColors.yellowDim, height: 44 }}>
      <Ionicons name="search-outline" size={18} color={wuzyColors.gray} style={{ marginRight: 8 }} />
      <TextInput
        value={localValue}
        onChangeText={(text) => {
          setLocalValue(text);
          onChangeText(text);
        }}
        onSubmitEditing={onSearchSubmit}
        placeholder={placeholder}
        placeholderTextColor={wuzyColors.gray}
        style={{ flex: 1, fontFamily: wuzyFonts.body, fontSize: fontSize('body'), color: wuzyColors.white, paddingVertical: 0 }}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        underlineColorAndroid="transparent"
        selectionColor={wuzyColors.yellow}
      />
      {localValue.length > 0 && (
        <Pressable onPress={handleClear} accessibilityLabel="Clear search" style={{ marginLeft: 8 }}>
          <Ionicons name="close-circle-outline" size={20} color={wuzyColors.gray} />
        </Pressable>
      )}
    </View>
  );
}
