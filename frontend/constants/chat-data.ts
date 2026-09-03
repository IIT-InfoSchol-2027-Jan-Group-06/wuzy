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

export type ThreadMessage = {
  text: string;
  out: boolean;
};

export type ChatThread = {
  date: string;
  messages: ThreadMessage[];
};

export const chatThreads: Record<string, ChatThread> = {
  '1': {
    date: 'July 30',
    messages: [
      { text: 'Hey! Are you ready for tonight?', out: true },
      { text: 'I secured the VIP passes. Main stage access included. 🚀', out: true },
      { text: "Yesss! I've been waiting for this set for months.", out: false },
      { text: 'What time are we meeting up?', out: false },
      { text: 'I can be at the venue by 9 PM. Is that too early?', out: false },
      { text: '9 PM is perfect. Gives us time to grab drinks before the opener.', out: true },
      { text: 'See you at the east gate!', out: true },
      { text: 'Still thinking about that beach volleyball meetup?', out: false },
      { text: 'Kinda nervous, never played before', out: true },
      { text: 'Just do it bro, wht to lose', out: false },
    ],
  },
  '2': {
    date: 'August 12',
    messages: [
      { text: 'Did you see the photos from the rooftop party?', out: true },
      { text: 'They came out so good!', out: true },
      { text: 'Omg yes, sending you the rest tonight', out: false },
      { text: 'Hey!', out: false },
    ],
  },
  '3': {
    date: 'August 20',
    messages: [
      { text: 'Rally practice moved to Saturday 7 AM.', out: false },
      { text: 'Track day at the old airfield this time.', out: false },
      { text: 'Count me in, I will bring the cones', out: true },
      { text: 'Come join us', out: false },
    ],
  },
  '4': {
    date: 'August 25',
    messages: [
      { text: 'You joining the futsal match tomorrow?', out: false },
      { text: 'Yeah but I am rusty, go easy on me', out: true },
      { text: 'No promises 😂', out: false },
      { text: 'Be a fun teammate!', out: false },
    ],
  },
  '5': {
    date: 'August 27',
    messages: [
      { text: 'We are doing a sunset hike on Friday', out: false },
      { text: 'Small group, easy trail, good views', out: false },
      { text: 'Sounds tempting ngl', out: true },
      { text: 'You wanna come?', out: false },
    ],
  },
  '6': {
    date: 'August 28',
    messages: [
      { text: '5K community run this Sunday at Galle Face.', out: false },
      { text: 'I have never run 5K straight before', out: true },
      { text: 'Just do it bro, wht to lose', out: false },
    ],
  },
  '7': {
    date: 'August 30',
    messages: [
      { text: 'Bro where were you yesterday?', out: false },
      { text: 'Got stuck at work, my bad', out: true },
      { text: 'All good, rematch this week', out: false },
      { text: 'Game at 5!', out: false },
    ],
  },
};