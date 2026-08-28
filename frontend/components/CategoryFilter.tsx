import { Pressable, ScrollView, Text, View, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

export interface CategoryFilterOption {
  id: string | number;
  label: string;
}

export interface CategoryPillProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function CategoryPill({ label, selected, onPress }: CategoryPillProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-5 py-2 active:opacity-75 ${
        selected ? 'bg-[#FFE285] border-transparent' : 'bg-[#2A2B20]/60 border border-[#FFE285]/40'
      }`}
    >
      <Text className={`font-semibold text-sm ${selected ? 'text-black' : 'text-[#FFE285]'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

export interface CategoryFilterProps<T> {
  options: CategoryFilterOption[];
  selectedId: string | number;
  onSelect: (id: string | number) => void;
  containerStyle?: ViewStyle;
  data?: T[];
  categoryKey?: keyof T;
  renderItem?: (item: T, index: number) => ReactNode;
  children?: ReactNode;
}

export function CategoryFilter<T>({
  options,
  selectedId,
  onSelect,
  containerStyle,
  data,
  categoryKey,
  renderItem,
  children,
}: CategoryFilterProps<T>) {
  const filteredData = data && categoryKey
    ? data.filter((item) => selectedId === 'all' || item[categoryKey] === selectedId)
    : [];

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          { paddingHorizontal: 16, gap: 10, paddingRight: 16 },
          containerStyle,
        ]}
        decelerationRate="fast"
      >
        {options.map((option) => (
          <CategoryPill
            key={String(option.id)}
            label={option.label}
            selected={option.id === selectedId}
            onPress={() => onSelect(option.id)}
          />
        ))}
      </ScrollView>

      {(data && renderItem) || children ? (
        <View className="mt-6">
          {filteredData.map((item, index) => (
            <View key={String(index)}>{renderItem?.(item, index)}</View>
          ))}
          {children}
        </View>
      ) : null}
    </View>
  );
}