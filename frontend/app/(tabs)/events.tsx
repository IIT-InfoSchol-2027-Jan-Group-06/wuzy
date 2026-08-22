import { Image, ScrollView, Text, View } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryFilter } from '@/components/CategoryFilter';
import { events, type Event } from '@/constants/feed-data';
import { wuzyFonts } from '@/constants/wuzy-theme';
import { PostCard } from '@/components/postcard';

const notification = require('@/assets/images/notification.png');

const categories = [
  { id: 'all', label: 'All' },
  { id: 'music', label: 'Music' },
  { id: 'sports', label: 'Sports' },
  { id: 'movie', label: 'Movie' },
  { id: 'tech', label: 'Tech' },
  { id: 'food', label: 'Food' },
];

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | number>('all');

  return (
    <View className="flex-1 bg-wuzy-bg">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1" style={{ backgroundColor: '#0A0F17' }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}>
          <View className="px-[32px] pt-[49px]">
            <View className="flex-row items-center justify-between">
              <Text
                className="text-[32px] leading-[32px] text-wuzy-yellow"
                style={{ fontFamily: wuzyFonts.display }}>
                Wuzy
              </Text>
              <Image source={notification} className="h-[35px] w-[35px]" />
            </View>

            <Text
              className="mt-[16px] text-[16px] text-wuzy-yellow"
              style={{ fontFamily: wuzyFonts.semibold }}>
              Recent
            </Text>
          </View>

          <CategoryFilter<Event>
            options={categories}
            selectedId={selectedCategory}
            onSelect={setSelectedCategory}
            data={events}
            categoryKey="category"
            containerStyle={{ marginTop: 16, marginHorizontal: -16 }}
            renderItem={(event) => (
              <PostCard
                key={event.id}
                post={{
                  id: event.id,
                  image: event.image,
                  avatar: event.avatar,
                  name: event.title,
                  location: 'Unknown',
                  likeCount: 0,
                  commentCount: 0,
                  category: event.category,
                }}
              />
            )}
          />

          <View className="mt-[41px] items-center">
            <Text
              className="text-[16px] text-wuzy-yellow"
              style={{ fontFamily: wuzyFonts.semibold }}>
              caught up with life
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}