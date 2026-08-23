import { Image, StyleProp, View, ViewStyle } from 'react-native';

import { Event } from '@/constants/feed-data';
import { wuzyColors } from '@/constants/wuzy-theme';
import { Avatar, CardShell, EventTitle } from './shared';

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

/**
 * Compact card for a single event: cover image with the creator's avatar and
 * the event title pinned to the bottom-left corner.
 */
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
    <CardShell width={width} height={height} onPress={onPress} disabled={disabled} style={style}>
      <Image source={event.image} className="absolute inset-0 h-full w-full" resizeMode="cover" />
      <View className="absolute bottom-[25px] left-[26px] flex-row items-center">
        <Avatar source={event.avatar} size={avatarSize} borderColor={accentColor} />
        <EventTitle title={event.title} style={{ marginLeft: 10 }} />
      </View>
    </CardShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Ready-made event card presets for the explore feed                          */
/* -------------------------------------------------------------------------- */

export function TaylorSwiftLiveCard() {
  return <EventCard event={{ id: '1', image: require('@/assets/images/event1.png'), avatar: require('@/assets/images/eventav1.png'), title: 'Taylor Swift Live', category: 'music' }} />;
}

export function Formula1GPCard() {
  return <EventCard event={{ id: '2', image: require('@/assets/images/event2.png'), avatar: require('@/assets/images/eventav2.png'), title: 'Formula 1 GP', category: 'sports' }} />;
}

export function YeezusTourCard() {
  return <EventCard event={{ id: '3', image: require('@/assets/images/event-yeezus.png'), avatar: require('@/assets/images/eventav1.png'), title: 'Yeezus Tour', category: 'music' }} />;
}

export function StarWarsNightCard() {
  return <EventCard event={{ id: '4', image: require('@/assets/images/event3.png'), avatar: require('@/assets/images/eventav2.png'), title: 'Star Wars Night', category: 'movie' }} />;
}

export function FocusLiveSessionsCard() {
  return <EventCard event={{ id: '5', image: require('@/assets/images/event4.png'), avatar: require('@/assets/images/eventav1.png'), title: 'Focus Live Sessions', category: 'music' }} />;
}

export function BassDropFestivalCard() {
  return <EventCard event={{ id: '6', image: require('@/assets/images/event5.png'), avatar: require('@/assets/images/eventav2.png'), title: 'Bass Drop Festival', category: 'music' }} />;
}

export function SunsetRooftopPartyCard() {
  return <EventCard event={{ id: '7', image: require('@/assets/images/event6.png'), avatar: require('@/assets/images/eventav1.png'), title: 'Sunset Rooftop Party', category: 'music' }} />;
}

export function UndergroundSessionsCard() {
  return <EventCard event={{ id: '8', image: require('@/assets/images/event7.png'), avatar: require('@/assets/images/eventav2.png'), title: 'Underground Sessions', category: 'music' }} />;
}

export function SambaStreetParadeCard() {
  return <EventCard event={{ id: '9', image: require('@/assets/images/event-poster-c.png'), avatar: require('@/assets/images/eventav1.png'), title: 'Samba Street Parade', category: 'music' }} />;
}

export function AfterHoursRooftopCard() {
  return <EventCard event={{ id: '10', image: require('@/assets/images/event-poster-d.png'), avatar: require('@/assets/images/eventav2.png'), title: 'After Hours Rooftop', category: 'music' }} />;
}

export function UrbanNightsFestivalCard() {
  return <EventCard event={{ id: '11', image: require('@/assets/images/post1.png'), avatar: require('@/assets/images/avatar1.png'), title: 'Urban Nights Festival', category: 'music' }} />;
}

export function MarathonMeetupCard() {
  return <EventCard event={{ id: '12', image: require('@/assets/images/post2.png'), avatar: require('@/assets/images/avatar2.png'), title: 'Marathon Meetup', category: 'sports' }} />;
}

export function SilvaSessionsCard() {
  return <EventCard event={{ id: '13', image: require('@/assets/images/post3.png'), avatar: require('@/assets/images/avatar3.png'), title: 'Silva Sessions', category: 'tech' }} />;
}

export function MumbaiBeatsCard() {
  return <EventCard event={{ id: '14', image: require('@/assets/images/post4.png'), avatar: require('@/assets/images/avatar4.png'), title: 'Mumbai Beats', category: 'food' }} />;
}