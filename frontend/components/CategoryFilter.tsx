import { ScrollView } from 'react-native';

import { Chip } from '@/components/Chip';
import { wuzyLayout } from '@/constants/wuzy-theme';

export interface CategoryFilterOption {
  id: string | number;
  label: string;
}

export interface CategoryFilterProps {
  options: CategoryFilterOption[];
  selectedId: string | number;
  onSelect: (id: string | number) => void;
}

/** Horizontal row of filter chips. Bleeds to the screen edges; the first chip aligns with the 32 gutter. */
export function CategoryFilter({ options, selectedId, onSelect }: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      style={{ marginHorizontal: -wuzyLayout.side }}
      contentContainerStyle={{ paddingHorizontal: wuzyLayout.side, gap: 8 }}>
      {options.map((option) => (
        <Chip
          key={String(option.id)}
          label={option.label}
          selected={option.id === selectedId}
          onPress={() => onSelect(option.id)}
        />
      ))}
    </ScrollView>
  );
}
