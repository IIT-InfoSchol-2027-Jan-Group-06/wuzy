import { ReactNode } from 'react';
import { Image, ImageSourcePropType, Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { wuzyColors } from '@/constants/wuzy-theme';
import { Avatar } from './avatar';
import { DateBadge } from './date-badge';
import { EventTitle } from './event-title';

type EventCardProps = {
  image: ImageSourcePropType;
  avatar: ImageSourcePropType;
  title: string;
  date?: string;
  month?: string;
  width?: number;
  height?: number;
  onPress?: () => void;
  showOverlay?: boolean;
  avatarSize?: number;
  accentColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

export function EventCard({
  image,
  avatar,
  title,
  date,
  month,
  width = 146,
  height = 218,
  onPress,
  showOverlay = true,
  avatarSize = 24,
  accentColor = wuzyColors.yellow,
  disabled = false,
  style,
  children,
}: EventCardProps) {
  const radius = 31;

  const content = (
    <>
      <Image source={image} className="absolute inset-0 h-full w-full" resizeMode="cover" />
      {showOverlay && (
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,1)']}
          className="absolute inset-x-0 bottom-0"
          style={{ height: height * 0.62 }}
        />
      )}
      {date && month && (
        <DateBadge
          date={date}
          month={month}
          style={{ position: 'absolute', right: 14, top: 14 }}
        />
      )}
      <View className="absolute bottom-[25px] left-[26px] flex-row items-center">
        <Avatar source={avatar} size={avatarSize} borderColor={accentColor} />
        <EventTitle title={title} style={{ marginLeft: 10 }} />
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