import { ImageSourcePropType } from 'react-native';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar: ImageSourcePropType;
  backgroundImage: ImageSourcePropType;
  tags: string[];
  awardsCount: number;
  photos: ImageSourcePropType[];
  location?: string;
  website?: string;
  followersCount?: number;
  followingCount?: number;
}

export const mockUserProfile: UserProfile = {
  id: '1',
  name: 'Ludwig Bennet',
  username: '@ludwigbennet',
  bio: 'Software engineer building high-performance systems with Go and OpenGL.',
  avatar: require('@/assets/images/avatar1.png'),
  backgroundImage: require('@/assets/images/event1.png'),
  tags: ['Music', 'Reading', 'Movie', 'Tech'],
  awardsCount: 4,
  photos: [
    require('@/assets/images/post1.png'),
    require('@/assets/images/post2.png'),
    require('@/assets/images/post3.png'),
    require('@/assets/images/post4.png'),
    require('@/assets/images/event1.png'),
    require('@/assets/images/event2.png'),
    require('@/assets/images/event3.png'),
    require('@/assets/images/event4.png'),
    require('@/assets/images/event5.png'),
  ],
  location: 'San Francisco, CA',
  website: 'ludwigbennet.dev',
  followersCount: 1240,
  followingCount: 320,
};