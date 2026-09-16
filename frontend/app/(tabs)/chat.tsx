import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

import { CategoryFilter } from '@/components/CategoryFilter';
import { Fab } from '@/components/Fab';
import { useNavBarMetrics } from '@/components/NavBar';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TabHeader } from '@/components/TabHeader';
import { MessageRow } from '@/components/chat/MessageRow';
import { formatVoiceTime } from '@/components/chat/Waveform';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';
import { useChatUnread } from '@/context/chat-unread';
import { useConversations } from '@/hooks/useConversations';
import { apiGet, assetUrl, relativeTime, type ApiGroup, type ApiPerson } from '@/lib/api';
import { consumeThreadActive } from '@/lib/chat-activity';
import { getThreadSummaries, getUnreadCounts, type ThreadSummaryRow } from '@/lib/chat-db';
import { acquireChat, subscribeChat } from '@/lib/ws';

const defaultAvatar = require('@/assets/images/avatar1.jpg');

/** Chat-list preview for the latest message: "<sender> : <preview>", where the
 *  sender is the other party's full name for received messages or "You" for
 *  your own. Preview kinds follow the reply spec: text verbatim, "Photo" for
 *  a picture, "voice message (m:ss)" for a voice note. */
function chatPreview(
  row: ThreadSummaryRow,
  currentUserId: number,
  peerName: string,
  memberNames: Map<number, string>,
): string {
  const sender =
    row.from_id === currentUserId
      ? 'You'
      : row.kind === 'dm'
        ? peerName
        : row.from_name ?? memberNames.get(row.from_id) ?? 'Member';
  const body = row.audio_url
    ? `voice message (${formatVoiceTime(row.duration_ms ?? 0)})`
    : row.media_url
      ? 'Photo'
      : row.text ?? '';
  return `${sender} : ${body}`;
}

const CATEGORIES = ['All', 'Unread'];
const categoryOptions = CATEGORIES.map((c) => ({ id: c, label: c }));

type ChatItem = {
  key: string;
  kind: 'dm' | 'group';
  threadId: number;
  otherUserId?: number;
  name: string;
  preview: string;
  time: string;
  atMs: number | null;
  avatar: { uri: string } | number;
  unread: boolean;
  onStartChat?: () => void;
};

export default function ChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { clearance } = useNavBarMetrics();
  const { conversations, loading, error, refresh } = useConversations();
  const { refresh: refreshUnread } = useChatUnread();
  const [active, setActive] = React.useState<string | number>('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [groups, setGroups] = React.useState<ApiGroup[]>([]);
  const [persons, setPersons] = React.useState<ApiPerson[]>([]);
  const [summaries, setSummaries] = React.useState<Record<string, ThreadSummaryRow>>({});
  const [unreadCounts, setUnreadCounts] = React.useState<Map<string, number>>(new Map());
  const [highlightKey, setHighlightKey] = React.useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    refresh();
    refreshUnread();
    try {
      setGroups(await apiGet<ApiGroup[]>('/groups'));
    } catch {
      setGroups([]);
    }
    try {
      setPersons(await apiGet<ApiPerson[]>('/chat/people'));
    } catch {
      setPersons([]);
    }
    const rows = await getThreadSummaries(user.id);
    const map: Record<string, ThreadSummaryRow> = {};
    for (const row of rows) {
      map[`${row.kind}-${row.thread_id}`] = row;
    }
    setSummaries(map);
    setUnreadCounts(await getUnreadCounts(user.id));

    // Highlight the thread the user just left, then fade it out.
    const lastActive = consumeThreadActive();
    const key = lastActive ? `${lastActive.kind}-${lastActive.id}` : null;
    setHighlightKey(key);
    if (key) {
      setTimeout(() => setHighlightKey((k) => (k === key ? null : k)), 1600);
    }
  }, [user, refresh, refreshUnread]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      // Opening the shared chat socket: the connection lives for as long as a
      // chat screen is on screen, and every inbound frame refreshes the list.
      const release = acquireChat(user.id);
      const unsubscribe = subscribeChat(async () => {
        await loadData();
      });
      loadData();
      return () => {
        unsubscribe();
        release();
      };
    }, [user, loadData]),
  );

  const openThread = useCallback(
    (threadId: number, kind: 'dm' | 'group') =>
      router.push({ pathname: '/chat/[id]', params: { id: String(threadId), kind } }),
    [router],
  );

  // A Connection with no thread yet: create the 1:1 conversation, then open it.
  const startChat = useCallback(
    async (person: ApiPerson) => {
      if (!user) return;
      try {
        const { conversation_id } = await apiGet<{ conversation_id: number }>(
          `/ws/conversations/${user.id}/${person.user.id}`,
        );
        openThread(conversation_id, 'dm');
      } catch {
        // Stay put; creating a thread is best-effort.
      }
    },
    [user, openThread],
  );

  let items: ChatItem[] = [];

  // Group threads come from the groups list.
  for (const g of groups) {
    const local = summaries[`group-${g.id}`];
    const preview = local
      ? chatPreview(
          local,
          user?.id ?? -1,
          g.name,
          new Map(g.members.map((m) => [m.id, m.display_name ?? m.username])),
        )
      : 'Group chat';
    const firstAvatar = g.members.find((m) => m.id !== user?.id)?.avatar_url;
    items.push({
      key: `group-${g.id}`,
      kind: 'group',
      threadId: g.id,
      name: g.name,
      preview,
      time: relativeTime(local?.created_at ?? null),
      atMs: local ? new Date(local.created_at).getTime() : null,
      avatar: firstAvatar ? { uri: assetUrl(firstAvatar) } : defaultAvatar,
      unread: (unreadCounts.get(`group-${g.id}`) ?? 0) > 0,
    });
  }

  // DM threads come from the conversations list.
  for (const c of conversations) {
    const local = summaries[`dm-${c.id}`];
    const peerName = c.other?.display_name ?? c.other?.username ?? 'Chat';
    const preview = local
      ? chatPreview(local, user?.id ?? -1, peerName, new Map())
      : c.preview ?? 'No messages yet';
    const at = c.last_message_at ?? local?.created_at ?? null;
    items.push({
      key: `dm-${c.id}`,
      kind: 'dm',
      threadId: c.id,
      otherUserId: c.other?.id ?? undefined,
      name: peerName,
      preview,
      time: relativeTime(at),
      atMs: at ? new Date(at).getTime() : null,
      avatar: c.other?.avatar_url ? { uri: assetUrl(c.other.avatar_url) } : defaultAvatar,
      unread: (unreadCounts.get(`dm-${c.id}`) ?? 0) > 0,
    });
  }

  // Connections without a thread yet get a start-chat row so connected people
  // are always reachable from the chat list.
  const startRows = persons
    .filter((p) => p.conversation_id === null && p.user.id !== user?.id)
    .map<ChatItem>((p) => ({
      key: `person-${p.user.id}`,
      kind: 'dm',
      threadId: -1,
      otherUserId: p.user.id,
      name: p.user.display_name ?? p.user.username,
      preview: 'Say hello',
      time: '',
      atMs: null,
      avatar: p.user.avatar_url ? { uri: assetUrl(p.user.avatar_url) } : defaultAvatar,
      unread: false,
      onStartChat: () => startChat(p),
    }));
  items = [...items, ...startRows];

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
          extraData={[highlightKey, unreadCounts, summaries]}
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
                  userId: item.otherUserId,
                  name: item.name,
                  preview: item.preview,
                  time: item.time,
                  avatar: item.avatar,
                  unread: item.unread,
                }}
                onPress={item.onStartChat ?? (() => openThread(item.threadId, item.kind))}
                onUserPress={
                  item.otherUserId ? () => router.push(`/profile/${item.otherUserId}`) : undefined
                }
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