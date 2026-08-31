import { ImageSourcePropType } from 'react-native';

export interface Ticket {
  id: string;
  image: ImageSourcePropType;
  title: string;
  date: string;
  venue: string;
  count: number;
  group: 'upcoming' | 'past';
  category: string;
  code: string;
}

export const tickets: Ticket[] = [
  {
    id: '1',
    image: require('@/assets/images/event1.png'),
    title: 'JUNGLE RUN',
    date: '19 JUN , 9AM',
    venue: 'TIME SQUARE',
    count: 2,
    group: 'upcoming',
    category: 'sports',
    code: 'WZ-TKT-1906',
  },
  {
    id: '2',
    image: require('@/assets/images/post2.png'),
    title: 'TAYLOR SWIFT LIVE',
    date: 'SAT, SEP 12 · 7:00 PM',
    venue: 'MADISON SQUARE GARDEN',
    count: 2,
    group: 'upcoming',
    category: 'music',
    code: 'WZ-TKT-0001',
  },
  {
    id: '3',
    image: require('@/assets/images/event2.png'),
    title: 'FORMULA 1 GP',
    date: 'SUN, OCT 04 · 2:30 PM',
    venue: 'SILVERSTONE CIRCUIT',
    count: 4,
    group: 'upcoming',
    category: 'sports',
    code: 'WZ-TKT-0002',
  },
  {
    id: '4',
    image: require('@/assets/images/event-yeezus.png'),
    title: 'YEEZUS TOUR',
    date: 'FRI, NOV 20 · 9:00 PM',
    venue: 'UNITED CENTER',
    count: 1,
    group: 'upcoming',
    category: 'music',
    code: 'WZ-TKT-0003',
  },
  {
    id: '5',
    image: require('@/assets/images/event4.png'),
    title: 'NBA FINALS GAME 7',
    date: 'WED, NOV 11 · 8:00 PM',
    venue: 'CRYPTO.COM ARENA',
    count: 2,
    group: 'upcoming',
    category: 'sports',
    code: 'WZ-TKT-0004',
  },
  {
    id: '6',
    image: require('@/assets/images/event-poster-c.png'),
    title: 'NEON HORIZON',
    date: 'SAT, OCT 03 · 9:00 PM',
    venue: 'BROOKLYN MIRAGE',
    count: 2,
    group: 'upcoming',
    category: 'music',
    code: 'WZ-TKT-0005',
  },
];
