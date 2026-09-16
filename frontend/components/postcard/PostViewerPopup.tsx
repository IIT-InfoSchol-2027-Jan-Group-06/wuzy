import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from './shared';
import { assetUrl, likePost, type ApiPost } from '@/lib/api';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

interface PostViewerPopupProps {
  /** The post to show; null hides the popup. */
  post: ApiPost | null;
  /** Fired on an outside tap. */
  onClose: () => void;
}

/** Instagram-style post viewer: the tapped grid tile opens as a centered frosted
  * card over a dim overlay, with the author, location and caption below the photo.
  * Same pattern as `ConnectionCardPopup`: lives inside the route via `Screen`'s
  * overlay so a pushed screen covers it and returning reveals it still open. */
export function PostViewerPopup({ post, onClose }: PostViewerPopupProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [liked, setLiked] = useState(post?.liked_by_me ?? false);

  if (!post) return null;

  const cardWidth = width - wuzyLayout.side * 2;
  const imageSize = Math.min(cardWidth, 360);

  const toggleLike = () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    // Optimistic: the heart already flipped; settle on the server's answer.
    likePost(post.id)
      .then((r) => setLiked(r.liked))
      .catch(() => setLiked(liked));
  };

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          top: -insets.top,
          bottom: -insets.bottom,
          zIndex: 200,
          elevation: 200,
        },
      ]}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: wuzyLayout.side,
          paddingVertical: 40,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        }}>
        <Pressable
          onPress={() => {}}
          className="w-full overflow-hidden rounded-[24px]"
          style={{ maxWidth: imageSize + wuzyLayout.side * 2, backgroundColor: wuzyColors.surface }}>
          <Image
            source={{ uri: assetUrl(post.media_url) }}
            style={{ width: '100%', aspectRatio: 1 }}
            resizeMode="cover"
          />

          <View style={{ padding: wuzyLayout.itemGap }}>
            <View className="flex-row items-center">
              <Avatar source={{ uri: assetUrl(post.user?.avatar_url ?? '') }} size={35} />
              <View className="ml-[12px] flex-1">
                <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.body, color: wuzyColors.white }}>
                  {post.user?.username ?? 'Unknown'}
                </Text>
                <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.small, color: wuzyColors.gray }}>
                  {post.location ?? ''}
                </Text>
              </View>
              <Pressable
                onPress={toggleLike}
                accessibilityRole="button"
                accessibilityLabel={liked ? 'Unlike post' : 'Like post'}
                hitSlop={10}>
                <Ionicons
                  name={liked ? 'heart' : 'heart-outline'}
                  size={26}
                  color={liked ? wuzyColors.yellow : wuzyColors.gray}
                />
              </Pressable>
            </View>

            {post.caption != null && post.caption !== '' && (
              <Text
                style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.body, color: wuzyColors.white, marginTop: wuzyLayout.itemGap }}>
                {post.caption}
              </Text>
            )}
          </View>
        </Pressable>
      </Pressable>
    </View>
  );
}