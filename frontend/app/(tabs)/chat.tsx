import React from 'react';
import { FlatList, Image, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchIcon } from '@/components/ChatIcons';
import { CategoryFilter } from '@/components/CategoryFilter';
import { MessageRow } from '@/components/chat/MessageRow';
import { chatMessages, CATEGORIES, type ChatMessage } from '@/constants/chat-data';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

export default function ChatScreen() {
  const [active, setActive] = React.useState('All');

  const categoryOptions = CATEGORIES.map((c) => ({ id: c, label: c }));

  return (
    <View className="flex-1" style={{ backgroundColor: wuzyColors.bg }}>
      <SafeAreaView edges={['top', 'bottom']} className="flex-1" style={{ backgroundColor: wuzyColors.bg }}>
        <Text
          className="text-center text-2xl pt-2 mt-[14px]"
          style={{ color: wuzyColors.yellow, fontFamily: wuzyFonts.semibold }}>
          Messages
        </Text>

        <View
          className="flex-row items-center rounded-[20px] px-4 mx-[30px] mt-[19px] h-[41px]"
          style={{ backgroundColor: wuzyColors.yellowDim }}>
          <SearchIcon size={18} color={wuzyColors.white} />
        </View>

        <View className="mt-[25px] px-[30px]">
          <CategoryFilter<ChatMessage>
            options={categoryOptions}
            selectedId={active}
            onSelect={(id) => setActive(id as string)}
            containerStyle={{ paddingHorizontal: 0 }}
          />
        </View>

        <FlatList
          data={chatMessages}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 22, paddingBottom: 100 }}
          renderItem={({ item }) => <MessageRow item={item} />}
        />

<TouchableOpacity
          activeOpacity={0.8}
          className="absolute bottom-[70px] right-[67px] h-[45px] w-[45px] items-center justify-center rounded-full"
          style={{ backgroundColor: wuzyColors.yellowDim }}>
          <Image
            source={require('@/assets/images/plus.png')}
            className="h-[30px] w-[30px]"
            resizeMode="contain"
          />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}