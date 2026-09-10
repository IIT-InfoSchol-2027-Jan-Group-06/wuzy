import { ImageSourcePropType } from 'react-native';

export interface Notification {
  id: string;
  avatar: ImageSourcePropType;
  label: string;
  name: string;
  timestamp: string;
  group: 'new' | 'past';
  category: 'events' | 'requests' | 'messages';
}

export const notifications: Notification[] = [
  { id: '1', avatar: require('@/assets/images/notif-avatar1.png'), label: 'New friend', name: 'alex wanner', timestamp: '1m', group: 'new', category: 'requests' },
  { id: '2', avatar: require('@/assets/images/notif-avatar2.png'), label: 'New friend', name: 'dev sharma', timestamp: '10m', group: 'new', category: 'requests' },
  { id: '3', avatar: require('@/assets/images/notif-avatar3.png'), label: 'New friend', name: 'ravi patel', timestamp: '3h', group: 'new', category: 'requests' },
  { id: '4', avatar: require('@/assets/images/notif-avatar4.png'), label: 'New friend', name: 'sofia gomez', timestamp: '2d', group: 'past', category: 'requests' },
  { id: '5', avatar: require('@/assets/images/notif-avatar5.png'), label: 'New friend', name: 'liam okafor', timestamp: '4d', group: 'past', category: 'requests' },
  { id: '6', avatar: require('@/assets/images/notif-avatar6.png'), label: 'New friend', name: 'marco silva', timestamp: '3 Aug', group: 'past', category: 'requests' },
  { id: '7', avatar: require('@/assets/images/notif-avatar7.png'), label: 'New friend', name: 'noah kim', timestamp: '1 Aug', group: 'past', category: 'requests' },
  { id: '8', avatar: require('@/assets/images/notif-avatar8.png'), label: 'New friend', name: 'omar ahmed', timestamp: '28 July', group: 'past', category: 'requests' },
  { id: '10', avatar: require('@/assets/images/event1.jpg'), label: 'Starts in 2 hours', name: 'Taylor Swift Live', timestamp: '5m', group: 'new', category: 'events' },
  { id: '11', avatar: require('@/assets/images/event2.jpg'), label: 'Tickets on sale', name: 'Formula 1 GP', timestamp: '1d', group: 'new', category: 'events' },
  { id: '12', avatar: require('@/assets/images/event3.jpg'), label: 'You checked in', name: 'Jazz Night', timestamp: '5d', group: 'past', category: 'events' },
  { id: '9', avatar: require('@/assets/images/avatar4.jpg'), label: 'New friend', name: 'chloe martin', timestamp: '20 July', group: 'past', category: 'requests' },
];
