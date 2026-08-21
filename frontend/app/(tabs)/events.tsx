import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AfterHoursRooftopCard,
  BassDropFestivalCard,
  FocusLiveSessionsCard,
  Formula1GPCard,
  MarathonMeetupCard,
  MumbaiBeatsCard,
  PostCard,
  SambaStreetParadeCard,
  SilvaSessionsCard,
  StarWarsNightCard,
  SunsetRooftopPartyCard,
  TaylorSwiftLiveCard,
  UndergroundSessionsCard,
  UrbanNightsFestivalCard,
  YeezusTourCard,
} from '@/components/postcard';
import { posts } from '@/constants/feed-data';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

const notification = require('@/assets/images/notification.png');
const plus = require('@/assets/images/plus.png');

export default function ExploreScreen() {
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
              <TaylorSwiftLiveCard />
              <Formula1GPCard />
              <YeezusTourCard />
              <StarWarsNightCard />
              <FocusLiveSessionsCard />
              <BassDropFestivalCard />
              <SunsetRooftopPartyCard />
              <UndergroundSessionsCard />
              <SambaStreetParadeCard />
              <AfterHoursRooftopCard />
              <UrbanNightsFestivalCard />
              <MarathonMeetupCard />
              <SilvaSessionsCard />
              <MumbaiBeatsCard />
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

      
      </SafeAreaView>
    </View>
  );
}