import { Image, StyleProp, Text, View, ViewStyle } from 'react-native';

import { Post } from '@/constants/feed-data';
import { wuzyFonts } from '@/constants/wuzy-theme';
import { Avatar, CardShell } from './shared';

type PostCardProps = {
  post: Post;
  width?: number;
  height?: number;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * A single, self-contained post card.
 *
 * Combines the cover image, author info (avatar + name + location) and the
 * action row (likes / comments / share) into one component using NativeWind
 * utility classes.
 */
export function PostCard({
  post,
  width = 300,
  height = 295,
  onPress,
  disabled = false,
  style,
}: PostCardProps) {
  return (
    <CardShell width={width} height={height} onPress={onPress} disabled={disabled} style={style}>
      {/* Full-bleed cover image filling the entire card */}
      <Image source={post.image} className="absolute inset-0 h-full w-full" resizeMode="cover" />

      {/* Bottom overlay so text stays readable over any photo */}
      <View className="absolute inset-x-0 bottom-0 h-[110px] bg-gradient-to-t from-black/80 to-transparent" />

      {/* Author row: avatar + name + location, pinned top-left */}
      <View className="absolute left-[21px] top-[19px] flex-row items-center">
        <Avatar source={post.avatar} size={35} />
        <View className="ml-[10px]">
          <Text className="text-[14px] text-white" style={{ fontFamily: wuzyFonts.medium }}>
            {post.name}
          </Text>
          <Text className="-mt-[2px] text-[12px] text-white" style={{ fontFamily: wuzyFonts.medium }}>
            {post.location}
          </Text>
        </View>
      </View>
    </CardShell>
  );
}