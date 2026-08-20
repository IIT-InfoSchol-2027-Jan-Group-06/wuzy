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
  },
  {
    id: '2',
    image: require('@/assets/images/event2.png'),
    avatar: require('@/assets/images/eventav2.png'),
    title: 'Formula 1 GP',
  },
  {
    id: '3',
    image: require('@/assets/images/event-yeezus.png'),
    avatar: require('@/assets/images/eventav1.png'),
    title: 'Yeezus Tour',
  },
  {
    id: '4',
    image: require('@/assets/images/event3.png'),
    avatar: require('@/assets/images/eventav2.png'),
    title: 'Star Wars Night',
  },
  {
    id: '5',
    image: require('@/assets/images/event4.png'),
    avatar: require('@/assets/images/eventav1.png'),
    title: 'Focus Live Sessions',
  },
  {
    id: '6',
    image: require('@/assets/images/event5.png'),
    avatar: require('@/assets/images/eventav2.png'),
    title: 'Bass Drop Festival',
  },
  {
    id: '7',
    image: require('@/assets/images/event6.png'),
    avatar: require('@/assets/images/eventav1.png'),
    title: 'Sunset Rooftop Party',
  },
  {
    id: '8',
    image: require('@/assets/images/event7.png'),
    avatar: require('@/assets/images/eventav2.png'),
    title: 'Underground Sessions',
  },
  {
    id: '9',
    image: require('@/assets/images/event-poster-c.png'),
    avatar: require('@/assets/images/eventav1.png'),
    title: 'Samba Street Parade',
  },
  {
    id: '10',
    image: require('@/assets/images/event-poster-d.png'),
    avatar: require('@/assets/images/eventav2.png'),
    title: 'After Hours Rooftop',
  },
  {
    id: '11',
    image: require('@/assets/images/post1.png'),
    avatar: require('@/assets/images/avatar1.png'),
    title: 'Urban Nights Festival',
  },
  {
    id: '12',
    image: require('@/assets/images/post2.png'),
    avatar: require('@/assets/images/avatar2.png'),
    title: 'Marathon Meetup',
  },
  {
    id: '13',
    image: require('@/assets/images/post3.png'),
    avatar: require('@/assets/images/avatar3.png'),
    title: 'Silva Sessions',
  },
  {
    id: '14',
    image: require('@/assets/images/post4.png'),
    avatar: require('@/assets/images/avatar4.png'),
    title: 'Mumbai Beats',
  },
];