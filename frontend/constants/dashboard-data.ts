import { ImageSourcePropType } from 'react-native';

export interface EventBannerData {
  image: ImageSourcePropType;
  tagline: string;
  title: string;
}

export interface MetricData {
  id: string;
  label: string;
  value: string;
}

export interface IncomePoint {
  label: string;
  value: number;
}

export const eventBanner: EventBannerData = {
  image: require('@/assets/images/event6.png'),
  tagline: 'AUG 15 • BERLIN',
  title: 'Neon Nights Vol. 4',
};

export const metrics: MetricData[] = [
  { id: 'registered', label: 'Registered Attendees', value: '230' },
  { id: 'sold', label: 'Tickets Sold', value: '150' },
];

export const incomeTotal = '$39,000';

export const incomePoints: IncomePoint[] = [
  { label: '1', value: 8 },
  { label: '5', value: 14 },
  { label: '9', value: 12 },
  { label: '13', value: 22 },
  { label: '17', value: 30 },
  { label: '21', value: 26 },
  { label: '25', value: 38 },
  { label: '29', value: 34 },
];

export const yAxisLabels = ['0', '10K', '20K', '30K', '40K'];
