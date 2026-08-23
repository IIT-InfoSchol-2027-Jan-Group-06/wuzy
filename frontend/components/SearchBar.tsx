import { Ionicons } from '@expo/vector-icons';
import { Pressable, TextInput, View } from 'react-native';
import { useRef, useState, useEffect } from 'react';

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

  useEffect(() => {
    setLocalValue(value ?? '');
  }, [value]);

  const handleClear = () => {
    setLocalValue('');
    onChangeText('');
    onClear?.();
  };

  const handleSubmit = () => {
    onSearchSubmit?.();
  };

  return (
    <View collapsable={false} style={{ backgroundColor: 'rgba(244, 196, 0, 0.1)', borderRadius: 9999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', width: '100%' }}>
      <View collapsable={false} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 }} pointerEvents="auto">
        <Ionicons name="search-outline" size={22} color="#FFFFFF" style={{ marginRight: 10 }} />
        <TextInput
          ref={inputRef}
          value={localValue}
          onChangeText={(text) => {
            setLocalValue(text);
            onChangeText(text);
          }}
          onSubmitEditing={handleSubmit}
          placeholder={placeholder}
          placeholderTextColor="#9A9980"
          style={{ flex: 1, fontSize: 16, color: '#FDF3C0', paddingVertical: 0, paddingHorizontal: 0 }}
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