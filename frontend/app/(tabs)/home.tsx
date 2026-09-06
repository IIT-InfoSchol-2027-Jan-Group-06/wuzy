import { ActivityIndicator, Pressable, ScrollView, Text } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { Fab } from '@/components/Fab';
import { GlassNavButton } from '@/components/GlassNavButton';
import { useNavBarMetrics } from '@/components/NavBar';
import { PostCard } from '@/components/postcard';
import { Screen } from '@/components/Screen';
import { TabHeader } from '@/components/TabHeader';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { useFeed } from '@/hooks/useFeed';

export default function HomeScreen() {
  const router = useRouter();
  const { clearance } = useNavBarMetrics();
  const { posts, loading, error, refresh } = useFeed();

  // Refetch whenever the home screen regains focus (e.g. after sharing a post)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return (
    <Screen overlay={<Fab onPress={() => router.push('/upload')} />}>
      {/* Fixed header that stays in place while the feed scrolls */}
      <TabHeader
        title="Wuzy"
        right={<GlassNavButton icon="notifications-outline" accessibilityLabel="Notifications" onPress={() => router.push('/notifications')} />}
      />

      <ScrollView
        className="flex-1"
        style={{ marginHorizontal: -wuzyLayout.side }}
        contentContainerStyle={{ paddingTop: wuzyLayout.gap, paddingBottom: clearance, paddingHorizontal: wuzyLayout.side, gap: wuzyLayout.gap }}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={wuzyColors.yellow} style={{ marginTop: wuzyLayout.gap }} />
        ) : error ? (
          <Pressable onPress={refresh} className="items-center" style={{ marginTop: wuzyLayout.gap }}>
            <Text className="text-center text-wuzy-gray" style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.body }}>
              {error}
            </Text>
            <Text className="text-wuzy-yellow" style={{ marginTop: wuzyLayout.itemGap, fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body }}>
              Tap to retry
            </Text>
          </Pressable>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </ScrollView>
    </Screen>
  );
}
