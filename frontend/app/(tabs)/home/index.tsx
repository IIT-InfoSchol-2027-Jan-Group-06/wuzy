import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Image } from 'expo-image';

import { PostCard } from '@/components/postcard';
import { GlassNavButton } from '@/components/GlassNavButton';
import { useFeed } from '@/hooks/useFeed';
import { wuzyFonts } from '@/constants/wuzy-theme';

export default function HomeScreen() {
  const router = useRouter();
  const { posts, loading, error, refresh } = useFeed();

  // Refetch whenever the home screen regains focus (e.g. after sharing a post)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleNotificationPress = () => router.push('/home/notifications');

  return (
    <View className="flex-1 bg-wuzy-bg">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1" style={{ backgroundColor: '#0A0F17' }}>
        {/* Fixed "Wuzy" header that stays in place while the feed scrolls */}
        <View className="flex-row items-center justify-between px-[32px] pt-[32px]">
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
            {loading ? (
              <ActivityIndicator size="large" color="#FFE783" className="mt-[40px]" />
            ) : error ? (
              <Pressable onPress={refresh} className="mt-[40px] items-center px-8">
                <Text className="text-wuzy-gray text-center" style={{ fontFamily: wuzyFonts.medium }}>
                  {error}
                </Text>
                <Text className="mt-3 text-wuzy-yellow" style={{ fontFamily: wuzyFonts.semibold }}>
                  Tap to retry
                </Text>
              </Pressable>
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      <GlassNavButton
        icon="add"
        onPress={() => router.push('/home/upload')}
        className="absolute bottom-20 right-6 z-50"
      />
    </View>
  );
}
