import { Ionicons } from '@expo/vector-icons';
import { Pressable, TextInput, View } from 'react-native';
import { useRef, useState } from 'react';

import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSearchSubmit?: () => void;
  onClear?: () => void;
  className?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
  onSearchSubmit,
  onClear,
  className = '',
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value ?? '');
  const inputRef = useRef<TextInput>(null);

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

  const handleSubmit = () => {
    onSearchSubmit?.();
  };

  return (
    <View collapsable={false} style={{ backgroundColor: wuzyColors.yellowDim, borderRadius: 20, height: 41, width: '100%' }}>
      <View collapsable={false} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }} pointerEvents="auto">
        <Ionicons name="search-outline" size={18} color="#CDC6B2" style={{ marginRight: 8 }} />
        <TextInput
          ref={inputRef}
          value={localValue}
          onChangeText={(text) => {
            setLocalValue(text);
            onChangeText(text);
          }}
          onSubmitEditing={handleSubmit}
          placeholder={placeholder}
          placeholderTextColor="#CDC6B2"
          style={{ flex: 1, fontFamily: wuzyFonts.body, fontSize: 14, color: wuzyColors.white, paddingVertical: 0, paddingHorizontal: 0 }}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          underlineColorAndroid="transparent"
          selectionColor="#FFE285"
          editable={true}
          textAlign="left"
          pointerEvents="auto"
        />
        {localValue.length > 0 && (
          <Pressable onPress={handleClear} accessibilityLabel="Clear search" style={{ marginLeft: 8 }}>
            <Ionicons name="close-circle-outline" size={20} color="#D0CFA6" />
          </Pressable>
        )}
      </View>
    </View>
  );
}