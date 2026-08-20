import { ReactNode } from 'react';
import { Image, ImageSourcePropType, Pressable, StyleProp, View, ViewStyle } from 'react-native';

import { Avatar } from './avatar';
import { PostAuthor } from './post-author';

type PostCardProps = {
  image: ImageSourcePropType;
  avatar: ImageSourcePropType;
  name: string;
  location: string;
  width?: number;
  height?: number;
  onPress?: () => void;
  avatarSize?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

export function PostCard({
  image,
  avatar,
  name,
  location,
  width = 300,
  height = 295,
  onPress,
  avatarSize = 35,
  disabled = false,
  style,
  children,
}: PostCardProps) {
  const radius = 31;

  const content = (
    <>
      <Image source={image} className="absolute inset-0 h-full w-full" resizeMode="cover" />
      <View className="absolute left-[21px] top-[19px] flex-row items-center">
        <Avatar source={avatar} size={avatarSize} />
        <PostAuthor name={name} location={location} style={{ marginLeft: 10 }} />
      </View>
      {children}
    </>
  );

  const outerStyle = [
    {
      width,
      height,
      borderRadius: radius,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className="relative overflow-hidden bg-wuzy-bg"
        style={({ pressed }) => [
          outerStyle,
          pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        ]}>
        {content}
      </Pressable>
    );
  }

  return (
    <View className="relative overflow-hidden bg-wuzy-bg" style={outerStyle}>
      {content}
    </View>
  );
}