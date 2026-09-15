import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Fab } from '@/components/Fab';
import { GlassNavButton } from '@/components/GlassNavButton';
import { useNavBarMetrics } from '@/components/NavBar';
import { PostCard } from '@/components/postcard';
import { Screen } from '@/components/Screen';
import { TabHeader } from '@/components/TabHeader';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { useFeed } from '@/hooks/useFeed';
import { useNotifications } from '@/hooks/useNotifications';
import { recordView } from '@/lib/api';

const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

export default function HomeScreen() {
  const router = useRouter();
  const { clearance } = useNavBarMetrics();
  const { posts, loading, error, refresh } = useFeed();
  // ponytail: badge refreshes on focus only; no socket held open on the feed.
  const { unread } = useNotifications();
  const recordedRef = useRef(new Set<number>());

  // Header hides on a downward scroll and slides back in on the first upward
  // nudge, no matter how far down the feed is.
  const scrollY = useSharedValue(0);
  const headerHidden = useSharedValue(0);
  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -headerHidden.value * wuzyLayout.glass }],
  }));
  const onScroll = useAnimatedScrollHandler((e) => {
    const y = Math.max(0, e.contentOffset.y);
    const dy = y - scrollY.value;
    scrollY.value = y;
    if (dy > 0 && y > wuzyLayout.glass) {
      headerHidden.value = withTiming(1, { duration: 200 });
    } else if (dy < 0) {
      headerHidden.value = withTiming(0, { duration: 200 });
    }
  });

const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: { item: (typeof posts)[number]; key: string | null }[] }) => {
      for (const { item } of viewableItems) {
        if (!item.save_to_profile && !recordedRef.current.has(item.id)) {
          recordedRef.current.add(item.id);
          recordView(item.id);
        }
      }
    },
    [],
  );

  // Refetch whenever the home screen regains focus (e.g. after sharing a post)
  useFocusEffect(
    useCallback(() => {
      refresh();
      recordedRef.current.clear();
    }, [refresh]),
  );

  return (
    <Screen overlay={<Fab onPress={() => router.push('/upload')} />}>
      {/* Pinned bell: stays at the top-right while the title scrolls away */}
      <View style={{ position: 'absolute', top: wuzyLayout.top, right: wuzyLayout.side, zIndex: 3, elevation: 4 }}>
        <GlassNavButton
          icon="notifications-outline"
          badge={unread}
          accessibilityLabel="Notifications"
          onPress={() => router.push('/notifications')}
        />
      </View>

      {/* Title slides out with the feed and slides back in as soon as the user scrolls up a little */}
      <View
        style={{
          position: 'absolute',
          top: wuzyLayout.top,
          left: 0,
          right: 0,
          height: wuzyLayout.glass,
          overflow: 'hidden',
          paddingHorizontal: wuzyLayout.side,
          zIndex: 2,
        }}>
        <Animated.View style={headerStyle}>
          <TabHeader title="Wuzy" />
        </Animated.View>
      </View>

      <Animated.FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PostCard post={item} onUserPress={() => item.user?.id && router.push(`/profile/${item.user.id}`)} />
        )}
        onScroll={onScroll}
        scrollEventThrottle={16}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        style={{ marginHorizontal: -wuzyLayout.side }}
        contentContainerStyle={{
          paddingTop: wuzyLayout.glass + wuzyLayout.gap,
          paddingBottom: clearance,
          paddingHorizontal: wuzyLayout.side,
          gap: wuzyLayout.gap,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && !error ? (
            <Text className="text-center text-wuzy-gray" style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.body, marginTop: wuzyLayout.gap }}>
              Nothing to see here yet
            </Text>
          ) : null
        }
        ListHeaderComponent={
          loading ? (
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
          ) : null
        }
      />
    </Screen>
  );
}