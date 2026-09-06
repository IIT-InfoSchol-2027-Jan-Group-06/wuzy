import { ImageSourcePropType } from 'react-native';

export interface EventAttendee {
  id: string;
  name: string;
  avatar: ImageSourcePropType;
}

export interface EventDetails {
  id: string;
  title: string;
  image: ImageSourcePropType;
  mapImage: ImageSourcePropType;
  description: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  latitude: number;
  longitude: number;
  attendees: EventAttendee[];
  additionalAttendeesCount: number;
  category: string;
  price?: string;
}

export const mockEvent: EventDetails = {
  id: '1',
  title: 'THE LIFE OF A SHOWGIRL',
  image: require('@/assets/images/event1.png'),
  // Placeholder art. Swap the file, keep the name.
  mapImage: require('@/assets/images/event-map.png'),
  description:
    'Step into the dazzling world of showgirls in this exclusive behind-the-scenes experience. "THE LIFE OF A SHOWGIRL" takes you on an intimate journey through the glamour, grit, and grace of the iconic performers who have graced the world\'s most famous stages. From the feathers and sequins to the discipline and dedication, discover what it truly means to live the life of a showgirl. This immersive exhibition features rare costumes, personal archives, and never-before-seen footage spanning decades of theatrical history. Join us for an unforgettable evening celebrating the artistry, resilience, and sisterhood of these extraordinary women.',
  date: '9 AUG',
  time: '6:00 PM',
  venue: '88 Plams',
  location: 'Lekki, Lagos',
  latitude: 6.5244,
  longitude: 3.3792,
  attendees: [
    { id: '1', name: 'Sarah J.', avatar: require('@/assets/images/avatar1.png') },
    { id: '2', name: 'Mike T.', avatar: require('@/assets/images/avatar2.png') },
    { id: '3', name: 'Emily R.', avatar: require('@/assets/images/avatar3.png') },
    { id: '4', name: 'James K.', avatar: require('@/assets/images/avatar4.png') },
    { id: '5', name: 'Lisa M.', avatar: require('@/assets/images/avatar5.png') },
  ],
  additionalAttendeesCount: 5,
  category: 'entertainment',
  price: '₦15,000',
};

export const mockEvents: EventDetails[] = [mockEvent];
export interface FeaturedEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  price: string;
  imageUri: ImageSourcePropType;
  tagLabel: string;
  category: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  hostName: string;
  hostAvatar: ImageSourcePropType;
  dateDay: string;
  dateMonth: string;
  imageUri: ImageSourcePropType;
  category: string;
}

export const exploreCategories = [
  { id: 'all', label: 'All' },
  { id: 'music', label: 'Music' },
  { id: 'sports', label: 'Sports' },
  { id: 'movies', label: 'Movies' },
  { id: 'tech', label: 'Tech' },
  { id: 'food', label: 'Food' },
];

export const featuredEvents: FeaturedEvent[] = [
  { id: '1', title: 'Summer Music Festival', time: 'Sat, 15 Jun, 6:00 PM', location: 'Central Park, NYC', price: '$89', imageUri: { uri: 'https://picsum.photos/seed/event1/400/600' }, tagLabel: 'Selling fast', category: 'music' },
  { id: '2', title: 'Tech Conference 2024', time: 'Fri, 22 Jun, 9:00 AM', location: 'Moscone Center, SF', price: '$299', imageUri: { uri: 'https://picsum.photos/seed/event2/400/600' }, tagLabel: 'Early bird', category: 'tech' },
  { id: '3', title: 'Food & Wine Expo', time: 'Sun, 30 Jun, 12:00 PM', location: 'Convention Center, LA', price: '$45', imageUri: { uri: 'https://picsum.photos/seed/event3/400/600' }, tagLabel: 'Popular', category: 'food' },
];

export const upcomingEvents: UpcomingEvent[] = [
  { id: '4', title: 'Indie Rock Night', hostName: 'The Velvet Room', hostAvatar: { uri: 'https://picsum.photos/seed/host1/50/50' }, dateDay: '8', dateMonth: 'AUG', imageUri: { uri: 'https://picsum.photos/seed/event4/400/100' }, category: 'music' },
  { id: '5', title: 'Startup Pitch Night', hostName: 'Innovation Hub', hostAvatar: { uri: 'https://picsum.photos/seed/host2/50/50' }, dateDay: '12', dateMonth: 'AUG', imageUri: { uri: 'https://picsum.photos/seed/event5/400/100' }, category: 'tech' },
  { id: '6', title: 'Jazz in the Garden', hostName: 'Botanical Gardens', hostAvatar: { uri: 'https://picsum.photos/seed/host3/50/50' }, dateDay: '18', dateMonth: 'AUG', imageUri: { uri: 'https://picsum.photos/seed/event6/400/100' }, category: 'music' },
  { id: '7', title: 'Comedy Open Mic', hostName: 'Laugh Factory', hostAvatar: { uri: 'https://picsum.photos/seed/host4/50/50' }, dateDay: '25', dateMonth: 'AUG', imageUri: { uri: 'https://picsum.photos/seed/event7/400/100' }, category: 'movies' },
];
