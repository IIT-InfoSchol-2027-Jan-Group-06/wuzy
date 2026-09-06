import React from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CategoryFilter } from '@/components/CategoryFilter';
import { Fab } from '@/components/Fab';
import { useNavBarMetrics } from '@/components/NavBar';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TabHeader } from '@/components/TabHeader';
import { MessageRow } from '@/components/chat/MessageRow';
import { chatMessages, CATEGORIES } from '@/constants/chat-data';
import { wuzyLayout } from '@/constants/wuzy-theme';

const categoryOptions = CATEGORIES.map((c) => ({ id: c, label: c }));

export default function ChatScreen() {
  const router = useRouter();
  const { clearance } = useNavBarMetrics();
  const [active, setActive] = React.useState<string | number>('All');
  const [searchQuery, setSearchQuery] = React.useState('');

  const q = searchQuery.trim().toLowerCase();
  const filteredMessages = chatMessages.filter((msg) => {
    if (active === 'Unread' && !msg.unread) return false;
    if (active === 'Community' && msg.category !== 'community') return false;
    if (active === 'Groups' && msg.category !== 'group') return false;
    return !q || msg.name.toLowerCase().includes(q) || msg.preview.toLowerCase().includes(q);
  });

  return (
    <Screen overlay={<Fab onPress={() => {}} />}>
      <View style={{ gap: wuzyLayout.itemGap }}>
        <TabHeader title="Messages" />
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search messages" />
        <CategoryFilter options={categoryOptions} selectedId={active} onSelect={setActive} />
      </View>

      <FlatList
        data={filteredMessages}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: wuzyLayout.gap, paddingBottom: clearance, gap: wuzyLayout.itemGap }}
        renderItem={({ item }) => <MessageRow item={item} onPress={() => router.push(`/chat/${item.id}`)} />}
      />
    </Screen>
  );
}
