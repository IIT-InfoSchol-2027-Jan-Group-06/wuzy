import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';

import { PostCard } from '@/components/postcard';
import { GlassNavButton } from '@/components/GlassNavButton';
import { posts } from '@/constants/feed-data';
import { wuzyFonts } from '@/constants/wuzy-theme';

export default function HomeScreen() {
  const router = useRouter();
  const { href } = useLocalSearchParams();
  const isOnNotifications = href?.includes('notifications');

  const handleNotificationPress = () => {
    if (isOnNotifications) {
      router.back();
    } else {
      router.push('/home/notifications');
    }
  };

  return (
    <View className="flex-1 bg-wuzy-bg">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1" style={{ backgroundColor: '#0A0F17' }}>
        {/* Fixed "Wuzy" header that stays in place while the feed scrolls */}
        <View className="flex-row items-center justify-between px-[32px] pt-[49px]">
          <Text
            className="text-[32px] leading-[32px] text-wuzy-yellow"
            style={{ fontFamily: wuzyFonts.display }}>
            Wuzy
          </Text>
          <View className="flex-row items-center gap-[14px]">
            <Pressable
              className="h-[40px] w-[40px] items-center justify-center rounded-full active:opacity-75"
              onPress={handleNotificationPress}>
              <Image
                source={require('@/assets/icons/bell.svg')}
                style={{ width: 17.5, height: 20 }}
                contentFit="contain"
              />
            </Pressable>
          </View>
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
      </SafeAreaView>
      <GlassNavButton
        icon="add"
        onPress={() => router.push('/test-button')}
        className="absolute bottom-20 right-6 z-50"
      />
    </View>
  );
}