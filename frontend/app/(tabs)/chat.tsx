import React from 'react';
import { FlatList, Image, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchIcon } from '@/components/ChatIcons';
import { CategoryFilter } from '@/components/CategoryFilter';
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
            onSelect={setActive}
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

function MessageRow({ item }: { item: ChatMessage }) {
  return (
    <TouchableOpacity className="h-[60px] flex-row items-center px-[30px] py-[10px]">
      <View className="h-10 w-10 rounded-full items-center justify-center" style={{ borderWidth: 1, borderColor: wuzyColors.yellow }}>
        <Image source={item.avatar} className="h-10 w-10 rounded-full" />
      </View>
      <View className="ml-3 flex-1">
        <Text
          className="text-[13px] leading-[19.5px] text-white"
          style={{ fontFamily: wuzyFonts.semibold }}>
          {item.name}
        </Text>
        <View className="flex-row items-center">
          <Text
            numberOfLines={1}
            className="flex-1 text-[13px] leading-[19.5px] text-white"
            style={{ fontFamily: wuzyFonts.semibold }}>
            {item.preview}
          </Text>
          <Text
            className="text-[14px] leading-[21px]"
            style={{ fontFamily: wuzyFonts.semibold, color: wuzyColors.gray }}>
            {item.time}
          </Text>
        </View>
      </View>
      {item.unread && (
        <View className="ml-2 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: wuzyColors.yellow }} />
      )}
    </TouchableOpacity>
  );
}