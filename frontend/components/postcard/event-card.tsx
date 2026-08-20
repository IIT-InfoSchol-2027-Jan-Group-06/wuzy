import { Image, StyleProp, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
  showOverlay?: boolean;
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
  showOverlay = true,
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
      {showOverlay && (
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,1)']}
          className="absolute inset-x-0 bottom-0"
          style={{ height: height * 0.62 }}
        />
      )}
      <View className="absolute bottom-[25px] left-[26px] flex-row items-center">
        <Avatar source={event.avatar} size={avatarSize} borderColor={accentColor} />
        <EventTitle title={event.title} style={{ marginLeft: 10 }} />
      </View>
    </CardShell>
  );
}