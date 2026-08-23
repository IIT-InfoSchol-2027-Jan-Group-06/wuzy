import { wuzyColors } from './wuzy-theme';

export type ChatMessage = {
  id: string;
  name: string;
  preview: string;
  time: string;
  avatar: number;
  unread: boolean;
  category?: 'community' | 'group';
};

export const chatMessages: ChatMessage[] = [
  {
    id: '1',
    name: 'alex wanner',
    preview: 'Just do it bro, wht to lose',
    time: '.1d',
    avatar: require('@/assets/images/avatar1.png'),
    unread: true,
    category: 'community',
  },
  {
    id: '2',
    name: 'lily ruth',
    preview: 'Hey!',
    time: '.1d',
    avatar: require('@/assets/images/avatar2.png'),
    unread: true,
  },
  {
    id: '3',
    name: 'the rally club',
    preview: 'Come join us',
    time: '.1d',
    avatar: require('@/assets/images/avatar3.png'),
    unread: false,
    category: 'group',
  },
  {
    id: '4',
    name: 'dean di laurentis',
    preview: 'Be a fun teammate!',
    time: '.1d',
    avatar: require('@/assets/images/avatar4.png'),
    unread: false,
  },
  {
    id: '5',
    name: 'allie hayes',
    preview: 'You wanna come?',
    time: '.1d',
    avatar: require('@/assets/images/avatar5.png'),
    unread: true,
    category: 'group',
  },
  {
    id: '6',
    name: 'colombo runners club',
    preview: 'Just do it bro, wht to lose',
    time: '.1d',
    avatar: require('@/assets/images/avatar6.png'),
    unread: false,
    category: 'community',
  },
  {
    id: '7',
    name: 'lucas scott',
    preview: 'Game at 5!',
    time: '.1d',
    avatar: require('@/assets/images/avatar7.png'),
    unread: false,
  },
];

export const CATEGORIES = ['All', 'Unread', 'Community', 'Groups'];