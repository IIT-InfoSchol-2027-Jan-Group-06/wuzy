import { useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

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
  /** Controlled expansion: the refer screen lifts this so it can collapse a card. */
  expandedId?: string | null;
  onExpandedChange?: (id: string | null) => void;
  /** Expanded height per card; e.g. the approved referral card grows to fit its QR. */
  heightFor?: (c: Connection) => number | undefined;
  /** Rendered inside an expanded card instead of the action buttons; receives that card. */
  expandedContent?: (c: Connection) => ReactNode;
  /** Wired to the expanded card's "Go to profile" button. */
  onProfilePress?: (c: Connection) => void;
  /** Wired to the expanded card's "Refer to a friend" button. */
  onReferPress?: (c: Connection) => void;
}

/** The connections list block shared by the Connections screen and the refer screen: search, count, and the Wheel with its expand behaviour. */
export function ConnectionList({
  connections,
  loading,
  emptyLabel,
  showCount = true,
  expandedId: expandedIdProp,
  onExpandedChange,
  heightFor,
  expandedContent,
  onProfilePress,
  onReferPress,
}: ConnectionListProps) {
  const [query, setQuery] = useState('');
  // Only one card is expanded at a time; the wheel paints it above the others via frontIndex.
  const [internalExpandedId, setInternalExpandedId] = useState<string | null>(null);
  const expandedId = expandedIdProp !== undefined ? expandedIdProp : internalExpandedId;
  const setExpandedId = (id: string | null) => {
    if (onExpandedChange) onExpandedChange(id);
    else setInternalExpandedId(id);
  };

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

  // The expanded card is re-rendered last by the wheel and stacked above the rest.
  const frontIndex = useMemo(() => {
    if (!expandedId) return null;
    return filtered.findIndex((c) => c.id === expandedId);
  }, [filtered, expandedId]);

  const emptyText = connections.length === 0 ? emptyLabel : 'No connections match your search';

  return (
    // Taps outside an expanded card collapse it; nested Pressables below claim their own touches.
    <Pressable style={{ flex: 1 }} onPress={() => setExpandedId(null)}>
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
            frontIndex={frontIndex}
            renderItem={(c) => (
              <ConnectionCard
                connection={c}
                expanded={expandedId === c.id}
                heightOverride={heightFor ? heightFor(c) : undefined}
                onAvatarPress={() => setExpandedId(expandedId === c.id ? null : c.id)}
                onProfilePress={onProfilePress ? () => onProfilePress(c) : undefined}
                onReferPress={onReferPress ? () => onReferPress(c) : undefined}
                expandedContent={expandedContent ? expandedContent(c) : undefined}
              />
            )}
          />
        )}
      </View>
    </Pressable>
  );
}