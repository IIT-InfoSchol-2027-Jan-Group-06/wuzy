import { useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { ConnectionCard } from '@/components/ConnectionCard';
import { SearchBar } from '@/components/SearchBar';
import { Wheel } from '@/components/Wheel';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import type { Connection } from '@/constants/connection-data';

const CARD_HEIGHT = 132;

interface ConnectionListProps {
  connections: Connection[];
  loading: boolean;
  /** Shown when there are no connections at all (not when a search finds nothing). */
  emptyLabel: string;
  /** Running count under the search bar. The refer screen hides it. */
  showCount?: boolean;
  /** Fired when a card is tapped; the route opens the popup with that card. */
  onCardPress?: (c: Connection) => void;
}

/** The connections list block shared by the Connections screen and the refer screen: search, count, and the Wheel of cards. */
export function ConnectionList({ connections, loading, emptyLabel, showCount = true, onCardPress }: ConnectionListProps) {
  const [query, setQuery] = useState('');

  // Memoised so the wheel only resets when the results actually change.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return connections;
    return connections.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [query, connections]);

  const emptyText = connections.length === 0 ? emptyLabel : 'No connections match your search';

  return (
    <View style={{ flex: 1 }}>
      <View style={{ gap: wuzyLayout.itemGap }}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search connections" />
        {showCount && (
          <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body, color: wuzyColors.gray }}>
            {loading ? 'Loading' : `${filtered.length} connections`}
          </Text>
        )}
      </View>
      <View className="flex-1">
        {loading ? (
          <ActivityIndicator size="large" color={wuzyColors.yellow} style={{ marginTop: wuzyLayout.gap }} />
        ) : filtered.length === 0 ? (
          <Text
            className="text-center"
            style={{ marginTop: wuzyLayout.gap, fontFamily: wuzyFonts.body, fontSize: wuzyType.body, color: wuzyColors.gray }}>
            {emptyText}
          </Text>
        ) : (
          <Wheel
            data={filtered}
            keyExtractor={(c) => c.id}
            itemHeight={CARD_HEIGHT}
            gap={wuzyLayout.itemGap}
            renderItem={(c) => (
              <ConnectionCard
                connection={c}
                onPress={onCardPress ? () => onCardPress(c) : undefined}
              />
            )}
          />
        )}
      </View>
    </View>
  );
}
