import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavBar } from '@/components/nav-bar';
import { PostCard } from '@/components/postcard';
import { posts } from '@/constants/feed-data';
import { wuzyFonts } from '@/constants/wuzy-theme';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-[#000811]">
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Fixed "Wuzy" header that stays in place while the feed scrolls */}
        <View className="px-[32px] pt-[49px]">
          <Text
            className="text-[32px] leading-[32px] text-wuzy-yellow"
            style={{ fontFamily: wuzyFonts.display }}>
            Wuzy
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}>
          {/* "Home" label scrolls with the feed */}
          <View className="px-[32px]">
            <Text
              className="mt-[16px] text-[16px] text-wuzy-yellow"
              style={{ fontFamily: wuzyFonts.semibold }}>
              Home
            </Text>
          </View>

          {/* Home feed of post cards */}
          <View className="mt-[25px] items-center gap-[29px]">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </View>
        </ScrollView>

        <NavBar active="home" />
      </SafeAreaView>
    </View>
  );
}