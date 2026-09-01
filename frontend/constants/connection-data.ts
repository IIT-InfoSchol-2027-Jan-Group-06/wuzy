import { ImageSourcePropType } from 'react-native';

export interface Connection {
  id: string;
  name: string;
  username: string;
  avatar: ImageSourcePropType;
  online: boolean;
  tags: string[];
}

export const connections: Connection[] = [
  { id: '1', name: 'Alex Wanner', username: '@alexwanner', avatar: require('@/assets/images/avatar1.png'), online: true, tags: ['Music', 'Tech'] },
  { id: '2', name: 'Dev Sharma', username: '@devsharma', avatar: require('@/assets/images/avatar2.png'), online: true, tags: ['Design', 'Art'] },
  { id: '3', name: 'Ravi Patel', username: '@ravipatel', avatar: require('@/assets/images/avatar3.png'), online: false, tags: ['Gaming', 'Movies'] },
  { id: '4', name: 'Sofia Gomez', username: '@sofiagomez', avatar: require('@/assets/images/avatar4.png'), online: true, tags: ['Reading', 'Travel'] },
  { id: '5', name: 'Liam Okafor', username: '@liamokafor', avatar: require('@/assets/images/avatar5.png'), online: false, tags: ['Tech', 'Sports'] },
  { id: '6', name: 'Marco Silva', username: '@marcosilva', avatar: require('@/assets/images/avatar6.png'), online: false, tags: ['Music', 'Food'] },
  { id: '7', name: 'Noah Kim', username: '@noahkim', avatar: require('@/assets/images/avatar7.png'), online: true, tags: ['Art', 'Photography'] },
  { id: '8', name: 'Chloe Martin', username: '@chloemartin', avatar: require('@/assets/images/notif-avatar1.png'), online: true, tags: ['Art', 'Reading'] },
  { id: '9', name: 'Omar Ahmed', username: '@omarahmed', avatar: require('@/assets/images/notif-avatar2.png'), online: false, tags: ['Coding', 'Gaming'] },
  { id: '10', name: 'Emily Clark', username: '@emilyclark', avatar: require('@/assets/images/notif-avatar3.png'), online: true, tags: ['Music', 'Travel'] },
  { id: '11', name: 'James Carter', username: '@jamescarter', avatar: require('@/assets/images/notif-avatar4.png'), online: false, tags: ['Movies', 'Sports'] },
  { id: '12', name: 'Mia Thompson', username: '@miathompson', avatar: require('@/assets/images/notif-avatar5.png'), online: true, tags: ['Design', 'Food'] },
  { id: '13', name: 'Ethan Brown', username: '@ethanbrown', avatar: require('@/assets/images/notif-avatar6.png'), online: false, tags: ['Tech', 'Movies'] },
];
