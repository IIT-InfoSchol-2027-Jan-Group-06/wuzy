import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { ConnectionCard } from '@/components/ConnectionCard';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';
import { Wheel } from '@/components/Wheel';
import { toConnection, type Connection } from '@/constants/connection-data';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { apiGet, type ApiPerson } from '@/lib/api';

const CARD_HEIGHT = 132;

export default function ConnectionsScreen() {
  const [query, setQuery] = useState('');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  // A Connection is a mutual follow. Refetch on focus so a freshly scanned QR
  // connection shows up here with its share of the count.
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const people = await apiGet<ApiPerson[]>('/chat/people');
      setConnections(people.map((p) => toConnection(p.user)));
    } catch {
      setConnections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

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

  const emptyLabel = query ? 'No connections match your search' : 'No connections yet';

  return (
    <Screen>
      <View style={{ gap: wuzyLayout.itemGap }}>
        <ScreenHeader title="Connections" />
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search connections" />
        <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body, color: wuzyColors.gray }}>
          {loading ? 'Loading' : `${filtered.length} connections`}
        </Text>
      </View>
      <View className="flex-1">
        {loading ? (
          <ActivityIndicator size="large" color={wuzyColors.yellow} style={{ marginTop: wuzyLayout.gap }} />
        ) : filtered.length === 0 ? (
          <Text
            className="text-center"
            style={{ marginTop: wuzyLayout.gap, fontFamily: wuzyFonts.body, fontSize: wuzyType.body, color: wuzyColors.gray }}>
            {emptyLabel}
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