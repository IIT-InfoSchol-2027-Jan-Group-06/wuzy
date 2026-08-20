import { ImageSourcePropType } from 'react-native';

export interface Post {
  id: string;
  image: ImageSourcePropType;
  avatar: ImageSourcePropType;
  name: string;
  location: string;
}

export interface Event {
  id: string;
  image: ImageSourcePropType;
  avatar: ImageSourcePropType;
  title: string;
  date?: string;
  month?: string;
}

export const posts: Post[] = [
  {
    id: '1',
    image: require('@/assets/images/post1.png'),
    avatar: require('@/assets/images/avatar1.png'),
    name: 'Lana rae',
    location: 'new york',
  },
  {
    id: '2',
    image: require('@/assets/images/post2.png'),
    avatar: require('@/assets/images/avatar2.png'),
    name: 'New york run club',
    location: 'new jersey',
  },
  {
    id: '3',
    image: require('@/assets/images/post3.png'),
    avatar: require('@/assets/images/avatar3.png'),
    name: 'Yash silva',
    location: 'sri lanka',
  },
  {
    id: '4',
    image: require('@/assets/images/post4.png'),
    avatar: require('@/assets/images/avatar4.png'),
    name: 'Raya sing',
    location: 'mumbai',
  },
];

export const events: Event[] = [
  {
    id: '1',
    image: require('@/assets/images/event1.png'),
    avatar: require('@/assets/images/eventav1.png'),
    title: 'Taylor Swift Live',
    date: '9',
    month: 'AUG',
  },
  {
    id: '2',
    image: require('@/assets/images/event2.png'),
    avatar: require('@/assets/images/eventav2.png'),
    title: 'Formula 1 GP',
    date: '14',
    month: 'AUG',
  },
  {
    id: '3',
    image: require('@/assets/images/event-yeezus.png'),
    avatar: require('@/assets/images/eventav1.png'),
    title: 'Yeezus Tour',
    date: '21',
    month: 'AUG',
  },
  {
    id: '4',
    image: require('@/assets/images/event3.png'),
    avatar: require('@/assets/images/eventav2.png'),
    title: 'Star Wars Night',
    date: '8',
    month: 'SEP',
  },
  {
    id: '5',
    image: require('@/assets/images/event4.png'),
    avatar: require('@/assets/images/eventav1.png'),
    title: 'Focus Live Sessions',
    date: '21',
    month: 'SEP',
  },
  {
    id: '6',
    image: require('@/assets/images/event3.png'),
    avatar: require('@/assets/images/eventav2.png'),
    title: 'Jordan Air Fest',
    date: '4',
    month: 'SEP',
  },
  {
    id: '7',
    image: require('@/assets/images/event4.png'),
    avatar: require('@/assets/images/eventav1.png'),
    title: 'Neon Night Market',
    date: '12',
    month: 'OCT',
  },
  {
    id: '8',
    image: require('@/assets/images/event5.png'),
    avatar: require('@/assets/images/eventav2.png'),
    title: 'Bass Drop Festival',
    date: '18',
    month: 'OCT',
  },
  {
    id: '9',
    image: require('@/assets/images/event6.png'),
    avatar: require('@/assets/images/eventav1.png'),
    title: 'Sunset Rooftop Party',
    date: '25',
    month: 'OCT',
  },
  {
    id: '10',
    image: require('@/assets/images/event7.png'),
    avatar: require('@/assets/images/eventav2.png'),
    title: 'Underground Sessions',
    date: '1',
    month: 'NOV',
  },
  {
    id: '11',
    image: require('@/assets/images/event5.png'),
    avatar: require('@/assets/images/eventav1.png'),
    title: 'Vinyl & Vibes',
    date: '7',
    month: 'NOV',
  },
  {
    id: '12',
    image: require('@/assets/images/event6.png'),
    avatar: require('@/assets/images/eventav2.png'),
    title: 'Midnight Carnival',
    date: '15',
    month: 'NOV',
  },
  {
    id: '13',
    image: require('@/assets/images/event-poster-c.png'),
    avatar: require('@/assets/images/eventav1.png'),
    title: 'Samba Street Parade',
    date: '22',
    month: 'NOV',
  },
  {
    id: '14',
    image: require('@/assets/images/event-poster-d.png'),
    avatar: require('@/assets/images/eventav2.png'),
    title: 'After Hours Rooftop',
    date: '29',
    month: 'NOV',
  },
  {
    id: '15',
    image: require('@/assets/images/event7.png'),
    avatar: require('@/assets/images/eventav1.png'),
    title: 'Disco Fever Night',
    date: '5',
    month: 'DEC',
  },
  {
    id: '16',
    image: require('@/assets/images/event2.png'),
    avatar: require('@/assets/images/eventav2.png'),
    title: 'Techno Warehouse',
    date: '12',
    month: 'DEC',
  },
];