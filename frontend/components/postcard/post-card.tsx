import { Image, StyleProp, View, ViewStyle } from 'react-native';

import { Post } from '@/constants/feed-data';
import { Avatar } from './avatar';
import { CardShell } from './card-shell';
import { PostAuthor } from './post-author';

type PostCardProps = {
  post: Post;
  width?: number;
  height?: number;
  onPress?: () => void;
  avatarSize?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PostCard({
  post,
  width = 300,
  height = 295,
  onPress,
  avatarSize = 35,
  disabled = false,
  style,
}: PostCardProps) {
  return (
    <CardShell
      width={width}
      height={height}
      onPress={onPress}
      disabled={disabled}
      style={style}>
      <Image source={post.image} className="absolute inset-0 h-full w-full" resizeMode="cover" />
      <View className="absolute left-[21px] top-[19px] flex-row items-center">
        <Avatar source={post.avatar} size={avatarSize} />
        <PostAuthor name={post.name} location={post.location} style={{ marginLeft: 10 }} />
      </View>
    </CardShell>
  );
}