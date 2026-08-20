import { Image, StyleProp, View, ViewStyle } from 'react-native';

import { Event } from '@/constants/feed-data';
import { wuzyColors } from '@/constants/wuzy-theme';
import { Avatar } from './avatar';
import { CardShell } from './card-shell';
import { EventTitle } from './event-title';

type EventCardProps = {
  event: Event;
  width?: number;
  height?: number;
  onPress?: () => void;
  avatarSize?: number;
  accentColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function EventCard({
  event,
  width = 146,
  height = 218,
  onPress,
  avatarSize = 24,
  accentColor = wuzyColors.yellow,
  disabled = false,
  style,
}: EventCardProps) {
  return (
    <CardShell
      width={width}
      height={height}
      onPress={onPress}
      disabled={disabled}
      style={style}>
      <Image source={event.image} className="absolute inset-0 h-full w-full" resizeMode="cover" />
      <View className="absolute bottom-[25px] left-[26px] flex-row items-center">
        <Avatar source={event.avatar} size={avatarSize} borderColor={accentColor} />
        <EventTitle title={event.title} style={{ marginLeft: 10 }} />
      </View>
    </CardShell>
  );
}