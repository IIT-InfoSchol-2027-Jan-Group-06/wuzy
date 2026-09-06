import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';

import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { assetUrl, type ApiPost } from '@/lib/api';

/** Profile timeline: full-width three-column grid of a user's permanent posts, with loading and empty states. Owner's empty state doubles as a call-to-action to upload. */
export function ProfileGrid({
  posts,
  loading,
  gridItemSize,
  gap,
  onEmptyPress,
}: {
  posts: ApiPost[];
  loading: boolean;
  gridItemSize: number;
  gap: number;
  onEmptyPress?: () => void;
}) {
  if (loading) {
    return <ActivityIndicator size="small" color={wuzyColors.yellow} style={{ marginTop: wuzyLayout.gap }} />;
  }

  return (
    <View className="flex-row flex-wrap" style={{ gap, marginTop: wuzyLayout.itemGap }}>
      {posts.map((post) => (
        <Image
          key={post.id}
          source={{ uri: assetUrl(post.media_url) }}
          style={{ width: gridItemSize, height: gridItemSize }}
          resizeMode="cover"
        />
      ))}
      {posts.length === 0 && onEmptyPress && (
        <Pressable onPress={onEmptyPress} className="items-center self-center" style={{ paddingVertical: wuzyLayout.gap }}>
          <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.body, color: wuzyColors.gray }}>
            No posts yet, share your first one
          </Text>
        </Pressable>
      )}
      {posts.length === 0 && !onEmptyPress && (
        <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.body, color: wuzyColors.gray, marginTop: wuzyLayout.gap }}>
          No posts yet
        </Text>
      )}
    </View>
  );
}