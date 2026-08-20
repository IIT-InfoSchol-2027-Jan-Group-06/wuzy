import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavBar } from '@/components/nav-bar';
import { EventCard } from '@/components/postcard/event-card';
import { PostCard } from '@/components/postcard/post-card';
import { events, posts } from '@/constants/feed-data';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

const notification = require('@/assets/images/notification.png');
const plus = require('@/assets/images/plus.png');

export default function ExploreScreen() {
  return (
    <View className="flex-1 bg-wuzy-bg">
      <SafeAreaView edges={['top']} className="flex-1">
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

          <View className="mt-[25px] items-center">
            <PostCard post={posts[0]} />
          </View>

          <View className="mt-[25px]">
            <Text
              className="ml-[30px] text-[16px] text-wuzy-yellow"
              style={{ fontFamily: wuzyFonts.semibold }}>
              Recommendations
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-[23px]"
              contentContainerStyle={{ paddingLeft: 6, gap: 12 }}>
              <EventCard event={events[0]} />
              <EventCard event={events[1]} />
              <EventCard event={events[2]} />
              <EventCard event={events[3]} />
              <EventCard event={events[4]} />
              <EventCard event={events[5]} />
              <EventCard event={events[6]} />
              <EventCard event={events[7]} />
              <EventCard event={events[8]} />
              <EventCard event={events[9]} />
            </ScrollView>
          </View>

          <View className="mt-[42px] items-center gap-[29px]">
            <PostCard post={posts[1]} />
            <PostCard post={posts[2]} />
            <PostCard post={posts[3]} />
          </View>

          <View className="mt-[41px] items-center">
            <Text
              className="text-[16px] text-wuzy-yellow"
              style={{ fontFamily: wuzyFonts.semibold }}>
              caught up with life
            </Text>
          </View>
        </ScrollView>

        <View
          className="absolute bottom-[103px] right-[16px] h-[45px] w-[45px] items-center justify-center rounded-full"
          style={{ backgroundColor: wuzyColors.yellowDim }}>
          <Image source={plus} className="h-[30px] w-[30px]" />
        </View>

        <NavBar active="events" />
      </SafeAreaView>
    </View>
  );
}