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
import { useConversations } from '@/hooks/useConversations';
import { assetUrl, relativeTime } from '@/lib/api';

const defaultAvatar = require('@/assets/images/avatar1.jpg');

const CATEGORIES = ['All', 'Unread'];
const categoryOptions = CATEGORIES.map((c) => ({ id: c, label: c }));

export default function ChatScreen() {
  const router = useRouter();
  const { clearance } = useNavBarMetrics();
  const { conversations, loading, error, refresh } = useConversations();
  const [active, setActive] = React.useState<string | number>('All');
  const [searchQuery, setSearchQuery] = React.useState('');

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const q = searchQuery.trim().toLowerCase();
  const items = conversations.map((c) => ({
    id: String(c.id),
    userId: c.other?.id,
    name: c.other?.display_name ?? c.other?.username ?? 'Chat',
    preview: c.preview ?? '',
    time: relativeTime(c.last_message_at),
    avatar: c.other?.avatar_url ? { uri: assetUrl(c.other.avatar_url) } : defaultAvatar,
    unread: c.unread > 0,
  }));

  const filtered = items.filter((item) => {
    if (active === 'Unread' && !item.unread) return false;
    return !q || item.name.toLowerCase().includes(q) || item.preview.toLowerCase().includes(q);
  });

  return (
    <Screen overlay={<Fab onPress={() => {}} />}>
      <View style={{ gap: wuzyLayout.itemGap }}>
        <TabHeader title="Messages" />
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search messages" />
        <CategoryFilter options={categoryOptions} selectedId={active} onSelect={setActive} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={wuzyColors.yellow} style={{ marginTop: wuzyLayout.gap }} />
      ) : error ? (
        <Pressable onPress={refresh} className="items-center" style={{ marginTop: wuzyLayout.gap, paddingHorizontal: wuzyLayout.side }}>
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
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: wuzyLayout.gap, paddingBottom: clearance, gap: wuzyLayout.itemGap }}
          renderItem={({ item }) => (
            <MessageRow
              item={item}
              onPress={() => router.push(`/chat/${item.id}`)}
              onUserPress={item.userId ? () => router.push(`/profile/${item.userId}`) : undefined}
            />
          )}
          ListEmptyComponent={
            <View className="items-center" style={{ paddingTop: wuzyLayout.gap }}>
              <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.body, color: wuzyColors.gray }}>
                {searchQuery ? 'Nothing matches your search' : 'No conversations yet'}
              </Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}