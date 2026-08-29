import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useState, useMemo } from 'react';

import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter, type CategoryFilterOption } from '@/components/CategoryFilter';
import { GlassNavButton } from '@/components/GlassNavButton';
import { FeaturedEventCard } from '@/components/events/FeaturedEventCard';
import { UpcomingEventCard } from '@/components/events/UpcomingEventCard';
import { wuzyFonts } from '@/constants/wuzy-theme';

interface Event {
  id: string;
  title: string;
  time: string;
  location: string;
  price: string;
  imageUri: { uri: string };
  tagLabel: string;
  category: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  hostName: string;
  hostAvatar: { uri: string };
  dateDay: string;
  dateMonth: string;
  imageUri: { uri: string };
  category: string;
}

const categories: CategoryFilterOption[] = [
  { id: 'all', label: 'All' },
  { id: 'music', label: 'Music' },
  { id: 'sports', label: 'Sports' },
  { id: 'movies', label: 'Movies' },
  { id: 'tech', label: 'Tech' },
  { id: 'food', label: 'Food' },
];

const featuredEvents: Event[] = [
  {
    id: '1',
    title: 'Summer Music Festival',
    time: 'Sat, 15 Jun • 6:00 PM',
    location: 'Central Park, NYC',
    price: '$89',
    imageUri: { uri: 'https://picsum.photos/seed/event1/400/600' },
    tagLabel: 'Selling Fast',
    category: 'music',
  },
  {
    id: '2',
    title: 'Tech Conference 2024',
    time: 'Fri, 22 Jun • 9:00 AM',
    location: 'Moscone Center, SF',
    price: '$299',
    imageUri: { uri: 'https://picsum.photos/seed/event2/400/600' },
    tagLabel: 'Early Bird',
    category: 'tech',
  },
  {
    id: '3',
    title: 'Food & Wine Expo',
    time: 'Sun, 30 Jun • 12:00 PM',
    location: 'Convention Center, LA',
    price: '$45',
    imageUri: { uri: 'https://picsum.photos/seed/event3/400/600' },
    tagLabel: 'Popular',
    category: 'food',
  },
];

const upcomingEvents: UpcomingEvent[] = [
  {
    id: '4',
    title: 'Indie Rock Night',
    hostName: 'The Velvet Room',
    hostAvatar: { uri: 'https://picsum.photos/seed/host1/50/50' },
    dateDay: '8',
    dateMonth: 'AUG',
    imageUri: { uri: 'https://picsum.photos/seed/event4/400/100' },
    category: 'music',
  },
  {
    id: '5',
    title: 'Startup Pitch Night',
    hostName: 'Innovation Hub',
    hostAvatar: { uri: 'https://picsum.photos/seed/host2/50/50' },
    dateDay: '12',
    dateMonth: 'AUG',
    imageUri: { uri: 'https://picsum.photos/seed/event5/400/100' },
    category: 'tech',
  },
  {
    id: '6',
    title: 'Jazz in the Garden',
    hostName: 'Botanical Gardens',
    hostAvatar: { uri: 'https://picsum.photos/seed/host3/50/50' },
    dateDay: '18',
    dateMonth: 'AUG',
    imageUri: { uri: 'https://picsum.photos/seed/event6/400/100' },
    category: 'music',
  },
  {
    id: '7',
    title: 'Comedy Open Mic',
    hostName: 'Laugh Factory',
    hostAvatar: { uri: 'https://picsum.photos/seed/host4/50/50' },
    dateDay: '25',
    dateMonth: 'AUG',
    imageUri: { uri: 'https://picsum.photos/seed/event7/400/100' },
    category: 'movies',
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState<string | number>('all');
  const [searchText, setSearchText] = useState('');

  const horizontalPadding = Math.round(screenWidth * 0.085);
  const topPadding = Math.round(screenWidth * 0.13);
  const headerFontSize = Math.round(screenWidth * 0.065);
  const sectionTitleFontSize = Math.round(screenWidth * 0.04);
  const footerFontSize = Math.round(screenWidth * 0.025);

  const navigateToEvent = (eventId: string) => {
    router.push('/event-details');
  };

  // Filter events by category and search text
  const filteredFeaturedEvents = useMemo(() => {
    return featuredEvents.filter((event) => {
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      const matchesSearch = event.title.toLowerCase().includes(searchText.toLowerCase()) ||
        event.location.toLowerCase().includes(searchText.toLowerCase()) ||
        event.tagLabel.toLowerCase().includes(searchText.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchText]);

  const filteredUpcomingEvents = useMemo(() => {
    return upcomingEvents.filter((event) => {
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      const matchesSearch = event.title.toLowerCase().includes(searchText.toLowerCase()) ||
        event.hostName.toLowerCase().includes(searchText.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchText]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0F17' }}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: '#0A0F17' }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: Math.round(screenWidth * 0.37) }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingHorizontal: horizontalPadding, paddingTop: topPadding }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text
                style={{
                  color: '#FDF3C0',
                  fontSize: headerFontSize,
                  fontWeight: 'bold',
                  fontFamily: wuzyFonts.display,
                }}
              >
                Explore
              </Text>
              <GlassNavButton
                icon={
                  <Image
                    source={require('@/assets/icons/ticket.svg')}
                    style={{ width: 21, height: 14.7 }}
                    contentFit="contain"
                  />
                }
                onPress={() => router.push('/home/ticket-vault')}
              />
            </View>
          </View>

          <View style={{ paddingHorizontal: horizontalPadding, marginTop: Math.round(screenWidth * 0.03) }}>
            <SearchBar
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search events..."
              className="mb-4"
            />
          </View>

          <View style={{ marginTop: Math.round(screenWidth * 0.052) }}>
            <CategoryFilter
              options={categories}
              selectedId={selectedCategory}
              onSelect={setSelectedCategory}
              containerStyle={{ marginTop: 0, marginHorizontal: -(horizontalPadding - 50) }}
            />
          </View>

          <View style={{ paddingHorizontal: horizontalPadding, marginTop: Math.round(screenWidth * 0.05) }}>
            <Text
              style={{
                color: '#FFE285',
                fontSize: sectionTitleFontSize,
                fontWeight: 'bold',
                marginBottom: Math.round(screenWidth * 0.02),
                fontFamily: wuzyFonts.semibold,
              }}
            >
              Today
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: horizontalPadding }}
              snapToInterval={Math.round(screenWidth * 0.78)} // cardWidth + marginRight
              decelerationRate="fast"
            >
              {filteredFeaturedEvents.map((event) => (
                <FeaturedEventCard
                  key={event.id}
                  title={event.title}
                  time={event.time}
                  location={event.location}
                  price={event.price}
                  imageUri={event.imageUri}
                  tagLabel={event.tagLabel}
                  onVisit={() => navigateToEvent(event.id)}
                  onFavorite={() => {}}
                />
              ))}
            </ScrollView>
          </View>

          <View style={{ paddingHorizontal: horizontalPadding }}>
            <Text
              style={{
                color: '#FFE285',
                fontSize: sectionTitleFontSize,
                fontWeight: 'bold',
                marginVertical: Math.round(screenWidth * 0.03),
                fontFamily: wuzyFonts.semibold,
              }}
            >
              Up Coming
            </Text>
            {filteredUpcomingEvents.map((event) => (
              <UpcomingEventCard
                key={event.id}
                title={event.title}
                hostName={event.hostName}
                hostAvatar={event.hostAvatar}
                dateDay={event.dateDay}
                dateMonth={event.dateMonth}
                imageUri={event.imageUri}
                onPress={() => navigateToEvent(event.id)}
              />
            ))}
          </View>

          <View style={{ marginTop: Math.round(screenWidth * 0.03) }}>
            <Text
              style={{
                color: 'rgba(255, 226, 133, 0.7)',
                fontSize: footerFontSize,
                fontWeight: '600',
                paddingVertical: Math.round(screenWidth * 0.05),
                textAlign: 'center',
                fontFamily: wuzyFonts.semibold,
              }}
            >
              caught up with life
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}