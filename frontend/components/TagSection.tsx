import { ScrollView } from 'react-native';

import { Chip } from '@/components/Chip';

/** Horizontal row of interest tags, in the caller's gutter. */
export function TagSection({ tags, onTagPress }: { tags: string[]; onTagPress?: (tag: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {tags.map((tag, index) => (
        <Chip key={`${tag}-${index}`} label={tag} onPress={onTagPress ? () => onTagPress(tag) : undefined} />
      ))}
    </ScrollView>
  );
}
