import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { ConnectionCard } from '@/components/ConnectionCard';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';
import { Wheel } from '@/components/Wheel';
import { connections } from '@/constants/connection-data';
import { wuzyColors, wuzyFonts, wuzyLayout } from '@/constants/wuzy-theme';
import { useResponsive } from '@/hooks/useResponsive';

const CARD_HEIGHT = 132;

export default function ConnectionsScreen() {
  const { fontSize } = useResponsive();
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
  }, [query]);

  return (
    <Screen>
      <View style={{ gap: wuzyLayout.itemGap }}>
        <ScreenHeader title="Connections" />
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search connections" />
        <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: fontSize('body'), color: wuzyColors.gray }}>
          {filtered.length} connections
        </Text>
      </View>
      <View className="flex-1">
        {filtered.length === 0 ? (
          <Text
            className="text-center"
            style={{ marginTop: wuzyLayout.gap, fontFamily: wuzyFonts.body, fontSize: fontSize('body'), color: wuzyColors.gray }}>
            No connections match your search
          </Text>
        ) : (
          <Wheel
            data={filtered}
            keyExtractor={(c) => c.id}
            itemHeight={CARD_HEIGHT}
            gap={wuzyLayout.itemGap}
            renderItem={(c) => <ConnectionCard connection={c} />}
          />
        )}
      </View>
    </Screen>
  );
}
