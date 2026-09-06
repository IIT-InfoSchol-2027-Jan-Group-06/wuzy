import { useRef, useState } from 'react';
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

import { assetUrl, ApiPost } from '@/lib/api';
import { wuzyFonts, wuzyType } from '@/constants/wuzy-theme';
import { Avatar, CardShell } from './shared';

type PostCardProps = {
  post: ApiPost;
  disabled?: boolean;
  onUserPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * A single, self-contained post card.
 *
 * Combines the cover image and author info (avatar + name + location) into one
 * component using NativeWind utility classes. The card fills its parent's width
 * at a 335:418 aspect ratio.
 * Double-tapping toggles a like: a heart pops in, or a broken heart shakes and falls
 * on unlike. A small yellow heart in the corner marks a liked post and unlikes on tap.
 */
export function PostCard({
  post,
  disabled = false,
  onUserPress,
  style,
}: PostCardProps) {
  const [liked, setLiked] = useState(false);
  // Corner like heart: 40 on the 375 px reference, scaled with the screen.
  const { width } = useWindowDimensions();
  const likeIconSize = Math.round((40 / 375) * width);
  const [popScale] = useState(() => new Animated.Value(0));
  const [popOpacity] = useState(() => new Animated.Value(0));
  const [breakScale] = useState(() => new Animated.Value(0));
  const [breakOpacity] = useState(() => new Animated.Value(0));
  const [breakRotation] = useState(() => new Animated.Value(0));
  const lastTapRef = useRef(0);

  const triggerPop = () => {
    // Like animation: solid heart pops in, then fades out.
    popScale.stopAnimation();
    popOpacity.stopAnimation();
    breakScale.stopAnimation();
    breakOpacity.stopAnimation();
    breakRotation.stopAnimation();
    breakOpacity.setValue(0);
    popScale.setValue(0.2);
    popOpacity.setValue(1);
    Animated.spring(popScale, {
      toValue: 1,
      friction: 6,
      tension: 300,
      useNativeDriver: true,
    }).start();
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(popScale, {
          toValue: 1.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(popOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const triggerBreak = () => {
    // Unlike animation: broken heart shakes, then breaks apart and falls away.
    popScale.stopAnimation();
    popOpacity.stopAnimation();
    breakScale.stopAnimation();
    breakOpacity.stopAnimation();
    breakRotation.stopAnimation();
    popOpacity.setValue(0);
    breakScale.setValue(1);
    breakOpacity.setValue(1);
    breakRotation.setValue(0);
    Animated.sequence([
      Animated.parallel([
        Animated.sequence([
          Animated.timing(breakRotation, {
            toValue: -0.15,
            duration: 90,
            useNativeDriver: true,
          }),
          Animated.timing(breakRotation, {
            toValue: 0.15,
            duration: 90,
            useNativeDriver: true,
          }),
          Animated.timing(breakRotation, {
            toValue: -0.1,
            duration: 90,
            useNativeDriver: true,
          }),
          Animated.timing(breakRotation, {
            toValue: 0.1,
            duration: 90,
            useNativeDriver: true,
          }),
          Animated.timing(breakRotation, {
            toValue: 0,
            duration: 90,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(breakScale, {
          toValue: 1.25,
          friction: 5,
          tension: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(breakScale, {
          toValue: 0.2,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(breakRotation, {
          toValue: 0.6,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(breakOpacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const toggleLike = () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    if (nextLiked) {
      triggerPop();
    } else {
      triggerBreak();
    }
  };

  const handlePress = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      lastTapRef.current = 0;
      toggleLike();
    } else {
      lastTapRef.current = now;
    }
  };

  return (
    <CardShell disabled={disabled} style={[{ width: '100%', aspectRatio: 335 / 418 }, style]}>
      <Image source={{ uri: assetUrl(post.media_url) }} className="absolute inset-0 h-full w-full" resizeMode="cover" />

      <LinearGradient
        colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.4)', 'transparent']}
        locations={[0, 0.6, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120 }}
      />

      <Animated.View
        pointerEvents="none"
        className="absolute inset-0 items-center justify-center"
        style={{ opacity: popOpacity, transform: [{ scale: popScale }] }}>
        <Ionicons
          name="heart"
          size={96}
          color="white"
          style={{ textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 12 }}
        />
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        className="absolute inset-0 items-center justify-center"
        style={{
          opacity: breakOpacity,
          transform: [
            { scale: breakScale },
            { rotate: breakRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
          ],
        }}>
        <Ionicons
          name="heart-dislike"
          size={96}
          color="white"
          style={{ textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 12 }}
        />
      </Animated.View>

      <Pressable
        onPress={handlePress}
        disabled={disabled}
        accessibilityLabel={`Like post by ${post.user?.username ?? 'Unknown'}`}
        className="absolute inset-0"
      />

      {/* Author sits above the like overlay so avatar and name taps open the profile. */}
      <View className="absolute left-[21px] top-[19px] flex-row items-center">
        <Pressable onPress={onUserPress} disabled={disabled} hitSlop={8}>
          <Avatar source={{ uri: assetUrl(post.user?.avatar_url ?? '') }} size={35} />
        </Pressable>
        <View className="ml-[12px]">
          <Pressable onPress={onUserPress} disabled={disabled} hitSlop={8}>
            <Text className="text-white" style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.body }}>
              {post.user?.username ?? 'Unknown'}
            </Text>
          </Pressable>
          <Text className="-mt-[5px] text-white" style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.small }}>
            {post.location ?? ''}
          </Text>
        </View>
      </View>

      {liked && (
        <Pressable
          onPress={toggleLike}
          disabled={disabled}
          accessibilityLabel="Unlike post"
          accessibilityRole="button"
          hitSlop={10}

          className="absolute bottom-[21px] right-[21px]">
          <Ionicons
            name="heart"
            size={likeIconSize}
            color="#FFE783"
            style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 8 }}
          />
        </Pressable>
      )}
    </CardShell>
  );
}
