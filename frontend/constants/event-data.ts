import { ImageSourcePropType } from 'react-native';

export interface FeaturedEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  price: string;
  imageUri: ImageSourcePropType;
  tagLabel: string;
  category: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  hostName: string;
  hostAvatar: ImageSourcePropType;
  dateDay: string;
  dateMonth: string;
  imageUri: ImageSourcePropType;
  category: string;
}