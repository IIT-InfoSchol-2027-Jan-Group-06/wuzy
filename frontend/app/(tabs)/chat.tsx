import React from 'react';
import { FlatList, Image, Text, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryFilter } from '@/components/CategoryFilter';
import { SearchBar } from '@/components/SearchBar';
import { MessageRow } from '@/components/chat/MessageRow';
import { chatMessages, CATEGORIES, type ChatMessage } from '@/constants/chat-data';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

export default function ChatScreen() {
  const [active, setActive] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const { width: screenWidth } = useWindowDimensions();
  const scale = screenWidth / 375;

  const horizontalPadding = Math.round(20 * scale);
  const fabBottomMargin = Math.round(70 * scale);
  const fabSize = Math.round(45 * scale);
  const fabRightMargin = Math.round(67 * scale);

  const categoryOptions = CATEGORIES.map((c) => ({ id: c, label: c }));

  const filteredMessages = chatMessages.filter((msg) => {
    switch (active) {
      case 'All':
        return true;
      case 'Unread':
        return msg.unread;
      case 'Community':
        return msg.category === 'community';
      case 'Groups':
        return msg.category === 'group';
      default:
        return true;
    }
  }).filter((msg) => {
    if (!searchQuery) return true;
    return msg.preview.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: wuzyColors.bg }}>
      <Text
        className="text-center text-2xl pt-2"
        style={{ color: wuzyColors.yellow, fontFamily: wuzyFonts.semibold, marginTop: Math.round(10 * scale) }}>
        Messages
      </Text>

      <View collapsable={false} className="mx-[30px] mt-[19px]" style={{ zIndex: 10, elevation: 10 }}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search messages"
        />      </View>

      <View style={{ marginTop: Math.round(25 * scale), paddingHorizontal: horizontalPadding }}>
        <CategoryFilter<ChatMessage>
          options={categoryOptions}
          selectedId={active}
          onSelect={(id) => setActive(id as string)}
          containerStyle={{ paddingHorizontal: 0 }}
        />
      </View>

      <FlatList
        data={filteredMessages}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{
          paddingTop: Math.round(22 * scale),
          paddingBottom: Math.round(70 * scale) + Math.round(45 * scale) + Math.round(20 * scale),
        }}
        renderItem={({ item }) => <MessageRow item={item} />}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          position: 'absolute',
          bottom: fabBottomMargin,
          right: Math.round(67 * scale),
          width: fabSize,
          height: fabSize,
          borderRadius: fabSize / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: wuzyColors.yellowDim,
        }}>
        <Image
          source={require('@/assets/images/plus.png')}
          style={{ width: Math.round(30 * scale), height: Math.round(30 * scale) }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
