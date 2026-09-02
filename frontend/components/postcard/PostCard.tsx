import { useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Animated,
  Image,
  Pressable,
  StyleProp,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';

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
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = width ?? screenWidth - 40;
  const cardHeight = height ?? Math.round(cardWidth * (418 / 335));

  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const lastTapRef = useRef(0);

  const triggerHeart = () => {
    heartScale.stopAnimation();
    heartOpacity.stopAnimation();
    heartScale.setValue(0.2);
    heartOpacity.setValue(1);
    Animated.spring(heartScale, {
      toValue: 1,
      friction: 6,
      tension: 300,
      useNativeDriver: true,
    }).start();
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(heartScale, {
          toValue: 1.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const handlePress = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      lastTapRef.current = 0;
      triggerHeart();
    } else {
      lastTapRef.current = now;
    }
  };

  return (
    <CardShell width={cardWidth} height={cardHeight} disabled={disabled} style={style}>
      <Image source={post.image} className="absolute inset-0 h-full w-full" resizeMode="cover" />

      <LinearGradient
        colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.4)', 'transparent']}
        locations={[0, 0.6, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120 }}
      />

      <Animated.View
        pointerEvents="none"
        className="absolute inset-0 items-center justify-center"
        style={{ opacity: heartOpacity, transform: [{ scale: heartScale }] }}>
        <Ionicons
          name="heart"
          size={Math.round(cardWidth * 0.3)}
          color="white"
          style={{ textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 12 }}
        />
      </Animated.View>

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

      <Pressable
        onPress={handlePress}
        disabled={disabled}
        accessibilityLabel={`Like post by ${post.name}`}
        className="absolute inset-0"
      />
    </CardShell>
  );
}
