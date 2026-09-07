import type { ImageSourcePropType } from 'react-native';

export type AwardTaskAction = 'claim' | 'go' | 'add' | 'share';
export type AwardTaskStatus = 'ready' | 'inProgress';

export interface AwardTask {
  id: string;
  title: string;
  badge: ImageSourcePropType;
  current: number;
  max: number;
  statusText: string;
  status: AwardTaskStatus;
  action: AwardTaskAction;
  actionLabel: string;
}

export const awardTasks: AwardTask[] = [
  {
    id: 'attend-events',
    title: 'Attend 3 Live Events',
    badge: require('@/assets/badges/img15.png'),
    current: 3,
    max: 3,
    statusText: '3 / 3 completed',
    status: 'ready',
    action: 'claim',
    actionLabel: 'Claim',
  },
  {
    id: 'host-event',
    title: 'Host an Event',
    badge: require('@/assets/badges/img10.png'),
    current: 18,
    max: 30,
    statusText: '18 / 30 mins',
    status: 'inProgress',
    action: 'go',
    actionLabel: 'Go',
  },
  {
    id: 'connect-ravers',
    title: 'Connect with 10 Ravers',
    badge: require('@/assets/badges/img9.png'),
    current: 7,
    max: 10,
    statusText: '7 / 10 friends',
    status: 'inProgress',
    action: 'add',
    actionLabel: 'Add',
  },
  {
    id: 'share-ticket',
    title: 'Share an Event Ticket',
    badge: require('@/assets/badges/img13.png'),
    current: 0,
    max: 1,
    statusText: '0 / 1 shared',
    status: 'inProgress',
    action: 'share',
    actionLabel: 'Share',
  },
];