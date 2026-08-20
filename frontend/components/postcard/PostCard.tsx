import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleProp, Text, useWindowDimensions, View, ViewStyle } from 'react-native';

import { Post } from '@/constants/feed-data';
import { wuzyFonts } from '@/constants/wuzy-theme';
import { Avatar, CardShell } from './Shared';

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
 * Combines the cover image and author info (avatar + name + location) into one
 * component using NativeWind utility classes. The card fills the screen width
 * with a 10px gap on both sides, keeping the height proportional to its width.
 */
export function PostCard({
  post,
  width,
  height,
  onPress,
  disabled = false,
  style,
}: PostCardProps) {
  // Card width adapts to the screen size with 10px of margin on each side.
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = width ?? screenWidth - 40;
  // Height scales with width to keep the card's proportions (335x418 base).
  const cardHeight = height ?? Math.round(cardWidth * (418 / 335));

  return (
    <CardShell
      width={cardWidth}
      height={cardHeight}
      onPress={onPress}
      disabled={disabled}
      style={style}>
      {/* Full-bleed cover image filling the entire card */}
      <Image source={post.image} className="absolute inset-0 h-full w-full" resizeMode="cover" />

      {/* Top gradient so the white author text and avatar stay visible on bright photos */}
      <LinearGradient
        colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.4)', 'transparent']}
        locations={[0, 0.6, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120 }}
      />

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