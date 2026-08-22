import { Pressable, ScrollView, Text, type ViewStyle } from 'react-native';

export interface CategoryFilterOption {
  id: string | number;
  label: string;
}

export interface CategoryFilterProps {
  options: CategoryFilterOption[];
  selectedId: string | number;
  onSelect: (id: string | number) => void;
  containerStyle?: ViewStyle;
}

export function CategoryFilter({
  options,
  selectedId,
  onSelect,
  containerStyle,
}: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        { paddingHorizontal: 16, gap: 10 },
        containerStyle,
      ]}
    >
      {options.map((option) => {
        const isSelected = option.id === selectedId;
        return (
          <Pressable
            key={String(option.id)}
            onPress={() => onSelect(option.id)}
            className={`rounded-full px-5 py-2 active:opacity-75 ${
              isSelected
                ? 'bg-[#FFE285] border-transparent'
                : 'bg-[#2A2B20]/60 border border-[#FFE285]/40'
            }`}
          >
            <Text
              className={`font-semibold text-sm ${
                isSelected ? 'text-black' : 'text-[#FFE285]'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}