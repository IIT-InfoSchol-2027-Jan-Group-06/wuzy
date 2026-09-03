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