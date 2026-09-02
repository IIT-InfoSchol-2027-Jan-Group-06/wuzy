import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, StyleProp, Text, useWindowDimensions, View, ViewStyle } from 'react-native';

import { Post } from '@/constants/feed-data';
import { wuzyFonts } from '@/constants/wuzy-theme';
import { Avatar, CardShell } from './shared';

type PostCardProps = {
  post: Post;
  width?: number;
  height?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * A single, self-contained post card.
 *
 * Combines the cover image and author info (avatar + name + location) into one
 * component using NativeWind utility classes. The card fills the screen width
 * with a 10px gap on both sides, keeping the height proportional to its width.
 * Double-tapping the card pops a heart, like Instagram.
 */
export function PostCard({
  post,
  width,
  height,
  disabled = false,
  style,
}: PostCardProps) {
  // Card width adapts to the screen size with 10px of margin on each side.
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = width ?? screenWidth - 40;
  // Height scales with width to keep the card's proportions (335x418 base).
  const cardHeight = height ?? Math.round(cardWidth * (418 / 335));

  // Vanilla state heart, shown briefly after a double tap.
  const [showHeart, setShowHeart] = useState(false);
  // Last tap timestamp so two presses within the window read as a double tap.
  const lastTapRef = useRef(0);

  const handlePress = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      lastTapRef.current = 0;
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 500);
    } else {
      lastTapRef.current = now;
    }
  };

  return (
    <CardShell width={cardWidth} height={cardHeight} disabled={disabled} style={style}>
      {/* Full-bleed cover image filling the entire card */}
      <Image source={post.image} className="absolute inset-0 h-full w-full" resizeMode="cover" />

      {/* Top gradient so the white author text and avatar stay visible on bright photos */}
      <LinearGradient
        colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.4)', 'transparent']}
        locations={[0, 0.6, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120 }}
      />

      {/* Heart that shows on double tap, like Instagram */}
      {showHeart && (
        <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
          <Ionicons name="heart" size={Math.round(cardWidth * 0.28)} color="white" />
        </View>
      )}

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

      {/* Invisible tap layer to detect the double tap without converting the shell */}
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        accessibilityLabel={`Like post by ${post.name}`}
        className="absolute inset-0"
        style={({ pressed }) => (pressed ? { opacity: 0.5 } : undefined)}
      />
    </CardShell>
  );
}
