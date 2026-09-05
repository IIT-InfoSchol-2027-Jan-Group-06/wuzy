import { useMemo, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConnectionCard } from '@/components/ConnectionCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';
import { Wheel } from '@/components/Wheel';
import { connections } from '@/constants/connection-data';
import { wuzyFonts } from '@/constants/wuzy-theme';

const CARD_HEIGHT = 100;

export default function ConnectionsScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const bodySize = Math.round(screenWidth * 0.037);

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
    <View className="flex-1 bg-wuzy-bg">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1" style={{ backgroundColor: '#0A0F17' }}>
        <ScreenHeader title="Connections" />
        <View className="mx-[32px] mt-[16px]">
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search connections" />
        </View>
        <View className="px-[32px] mt-[16px]">
          <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: bodySize, color: '#8A96A6' }}>
            {filtered.length} connections
          </Text>
        </View>
        <View className="flex-1 px-[44px]">
          {filtered.length === 0 ? (
            <Text className="text-center mt-[24px]" style={{ fontFamily: wuzyFonts.body, fontSize: bodySize, color: '#8A96A6' }}>
              No connections match your search
            </Text>
          ) : (
            <Wheel
              data={filtered}
              keyExtractor={(c) => c.id}
              itemHeight={CARD_HEIGHT}
              renderItem={(c) => <ConnectionCard connection={c} />}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
