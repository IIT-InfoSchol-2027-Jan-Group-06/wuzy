import React from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { CategoryFilter } from '@/components/CategoryFilter';
import { Fab } from '@/components/Fab';
import { useNavBarMetrics } from '@/components/NavBar';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TabHeader } from '@/components/TabHeader';
import { MessageRow } from '@/components/chat/MessageRow';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';
import { useConversations } from '@/hooks/useConversations';
import { apiGet, assetUrl, relativeTime, type ApiGroup } from '@/lib/api';
import { consumeThreadActive } from '@/lib/chat-activity';
import { getThreadSummaries } from '@/lib/chat-db';

const defaultAvatar = require('@/assets/images/avatar1.jpg');

const CATEGORIES = ['All', 'Unread'];
const categoryOptions = CATEGORIES.map((c) => ({ id: c, label: c }));

type ChatItem = {
  key: string;
  kind: 'dm' | 'group';
  threadId: number;
  name: string;
  preview: string;
  time: string;
  atMs: number | null;
  avatar: { uri: string } | number;
  unread: boolean;
};

export default function ChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { clearance } = useNavBarMetrics();
  const { conversations, loading, error, refresh } = useConversations();
  const [active, setActive] = React.useState<string | number>('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [groups, setGroups] = React.useState<ApiGroup[]>([]);
  const [summaries, setSummaries] = React.useState<Record<string, { text: string; at: string }>>(
    {},
  );
  const [highlightKey, setHighlightKey] = React.useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    refresh();
    try {
      setGroups(await apiGet<ApiGroup[]>('/groups'));
    } catch {
      setGroups([]);
    }
    const rows = await getThreadSummaries(user.id);
    const map: Record<string, { text: string; at: string }> = {};
    for (const row of rows) {
      map[`${row.kind}-${row.thread_id}`] = { text: row.text, at: row.created_at };
    }
    setSummaries(map);

    // Highlight the thread the user just left, then fade it out.
    const lastActive = consumeThreadActive();
    const key = lastActive ? `${lastActive.kind}-${lastActive.id}` : null;
    setHighlightKey(key);
    if (key) {
      setTimeout(() => setHighlightKey((k) => (k === key ? null : k)), 1600);
    }
  }, [user, refresh]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  let items: ChatItem[] = [];

  // Group threads come from the groups list.
  for (const g of groups) {
    const local = summaries[`group-${g.id}`];
    const preview = local?.text ?? 'Group chat';
    const firstAvatar = g.members.find((m) => m.id !== user?.id)?.avatar_url;
    items.push({
      key: `group-${g.id}`,
      kind: 'group',
      threadId: g.id,
      name: g.name,
      preview,
      time: relativeTime(local?.at ?? null),
      atMs: local ? new Date(local.at).getTime() : null,
      avatar: firstAvatar ? { uri: assetUrl(firstAvatar) } : defaultAvatar,
      unread: false,
    });
  }

  // DM threads come from the conversations list.
  for (const c of conversations) {
    const local = summaries[`dm-${c.id}`];
    const preview = c.preview ?? local?.text ?? 'No messages yet';
    const at = c.last_message_at ?? local?.at ?? null;
    items.push({
      key: `dm-${c.id}`,
      kind: 'dm',
      threadId: c.id,
      name: c.other?.display_name ?? c.other?.username ?? 'Chat',
      preview,
      time: relativeTime(at),
      atMs: at ? new Date(at).getTime() : null,
      avatar: c.other?.avatar_url ? { uri: assetUrl(c.other.avatar_url) } : defaultAvatar,
      unread: c.unread > 0,
    });
  }

  // Newest activity on top, so a just-messaged chat rises to the top.
  items.sort((a, b) => (b.atMs ?? -Infinity) - (a.atMs ?? -Infinity));

  const q = searchQuery.trim().toLowerCase();
  const filtered = items.filter((item) => {
    if (active === 'Unread' && !item.unread) return false;
    return !q || item.name.toLowerCase().includes(q) || item.preview.toLowerCase().includes(q);
  });

  // Move the just-active thread to the very top regardless of timestamp.
  if (highlightKey) {
    const idx = filtered.findIndex((i) => i.key === highlightKey);
    if (idx > 0) {
      const [moved] = filtered.splice(idx, 1);
      filtered.unshift(moved);
    }
  }

  return (
    <Screen overlay={<Fab onPress={() => router.push('/new-group')} />}>
      <View style={{ gap: wuzyLayout.itemGap }}>
        <TabHeader title="Messages" />
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search messages" />
        <CategoryFilter options={categoryOptions} selectedId={active} onSelect={setActive} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={wuzyColors.yellow} style={{ marginTop: wuzyLayout.gap }} />
      ) : error ? (
        <Pressable onPress={loadData} className="items-center" style={{ marginTop: wuzyLayout.gap, paddingHorizontal: wuzyLayout.side }}>
          <Text className="text-center text-wuzy-gray" style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.body }}>
            {error}
          </Text>
          <Text className="text-wuzy-yellow" style={{ marginTop: wuzyLayout.itemGap, fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body }}>
            Tap to retry
          </Text>
        </Pressable>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: wuzyLayout.gap, paddingBottom: clearance, gap: wuzyLayout.itemGap }}
          extraData={highlightKey}
          renderItem={({ item }) => (
            <View
              style={
                item.key === highlightKey
                  ? {
                      borderRadius: 24,
                      backgroundColor: wuzyColors.yellowDim,
                      paddingHorizontal: wuzyLayout.itemGap,
                    }
                  : undefined
              }>
              <MessageRow
                item={{
                  id: item.key,
                  userId: item.kind === 'dm' ? item.threadId : undefined,
                  name: item.name,
                  preview: item.preview,
                  time: item.time,
                  avatar: item.avatar,
                  unread: item.unread,
                }}
                onPress={() =>
                  router.push({ pathname: '/chat/[id]', params: { id: String(item.threadId), kind: item.kind } })
                }
                onUserPress={item.kind === 'dm' ? () => router.push(`/profile/${item.threadId}`) : undefined}
              />
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center" style={{ paddingTop: wuzyLayout.gap }}>
              <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.body, color: wuzyColors.gray }}>
                {searchQuery ? 'Nothing matches your search' : 'No chats yet'}
              </Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}
