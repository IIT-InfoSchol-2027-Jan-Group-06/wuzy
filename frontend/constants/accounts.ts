import { ImageSourcePropType } from 'react-native';

/**
 * The five demo accounts from the backend seed. Credentials and usernames must
 * match seed.py so the login screen's one-tap chips can log straight in.
 * Cosmetic extras (hero background, awards) have no table yet, so they stay here.
 */
export interface Account {
  email: string;
  password: string;
  username: string;
  displayName: string;
  avatar: ImageSourcePropType;
  backgroundImage: ImageSourcePropType;
  awardsCount: number;
}

export const accounts: Account[] = [
  {
    email: 'abhiruk@test.com',
    password: 'password123',
    username: 'abhiruk',
    displayName: 'Abhiruk Prashan',
    avatar: require('@/assets/images/avatar1.jpg'),
    backgroundImage: require('@/assets/images/event1.jpg'),
    awardsCount: 4,
  },
  {
    email: 'ravidu@test.com',
    password: 'password123',
    username: 'ravidu',
    displayName: 'Ravidu Bandara',
    avatar: require('@/assets/images/avatar2.jpg'),
    backgroundImage: require('@/assets/images/event2.jpg'),
    awardsCount: 2,
  },
  {
    email: 'sethuki@test.com',
    password: 'password123',
    username: 'sethuki',
    displayName: 'Sethuki Fernando',
    avatar: require('@/assets/images/avatar3.jpg'),
    backgroundImage: require('@/assets/images/event3.jpg'),
    awardsCount: 5,
  },
  {
    email: 'azma@test.com',
    password: 'password123',
    username: 'azma',
    displayName: 'Azma Nizar',
    avatar: require('@/assets/images/avatar4.jpg'),
    backgroundImage: require('@/assets/images/event4.jpg'),
    awardsCount: 3,
  },
  {
    email: 'charuki@test.com',
    password: 'password123',
    username: 'charuki',
    displayName: 'Charuki Jayasuriya',
    avatar: require('@/assets/images/avatar5.jpg'),
    backgroundImage: require('@/assets/images/event5.jpg'),
    awardsCount: 4,
  },
];

/** Cosmetic profile extras for the logged-in user; falls back to the first account. */
export function accountFor(username: string | undefined): Account {
  return accounts.find((a) => a.username === username) ?? accounts[0];
}