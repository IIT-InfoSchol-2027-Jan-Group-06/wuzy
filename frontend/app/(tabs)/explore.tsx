import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { CategoryFilter, type CategoryFilterOption } from '@/components/CategoryFilter';
import { FeaturedEventCard } from '@/components/events/FeaturedEventCard';
import { UpcomingEventCard } from '@/components/events/UpcomingEventCard';
import { GlassNavButton } from '@/components/GlassNavButton';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TabHeader } from '@/components/TabHeader';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import {
  apiEngageEvent,
  apiGetEventCategories,
  apiGetRecommendedEvents,
  assetUrl,
  type ApiRecommendedEvent,
} from '@/lib/api';

const TAG_BY_REASON: Record<string, string> = {
  interest: 'For you',
  trending: 'Hot',
  discover: 'Discover',
};

export default function ExploreScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | number>('all');
  const [searchText, setSearchText] = useState('');
  const [events, setEvents] = useState<ApiRecommendedEvent[]>([]);
  const [categories, setCategories] = useState<CategoryFilterOption[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiGetRecommendedEvents(), apiGetEventCategories()])
      .then(([eventList, categoryList]) => {
        setEvents(eventList);
        const options: CategoryFilterOption[] = [
          { id: 'all', label: 'All' },
          ...categoryList.map((category) => ({ id: category.id, label: category.label })),
        ];
        setCategories(options);
        setSelectedCategory((current) =>
          current !== 'all' && !options.some((option) => option.id === current) ? 'all' : current,
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => load(), [load]));

  const q = searchText.trim().toLowerCase();
  const inCategory = (category: string) => selectedCategory === 'all' || category === selectedCategory;
  const listed = events.filter(
    (e) =>
      inCategory(e.category) &&
      (!q || [e.title, e.host_name ?? '', e.venue ?? ''].some((s) => s.toLowerCase().includes(q))),
  );

  const today = new Date();
  const featured = listed.filter((e) => new Date(e.start_time).getDate() === today.getDate());
  const upcoming = listed.filter((e) => new Date(e.start_time).getDate() !== today.getDate());

  const eventTime = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  const going = (id: number) => apiEngageEvent(id, 'going');

  const sectionTitle = { fontFamily: wuzyFonts.semibold, fontSize: wuzyType.section, color: wuzyColors.yellow };

  return (
    <Screen scroll style={{ gap: wuzyLayout.gap }}>
      <View style={{ gap: wuzyLayout.gap }}>
        <TabHeader
          title="Explore"
          right={
            <GlassNavButton
              accessibilityLabel="Tickets"
              icon={<Image source={require('@/assets/icons/ticket.svg')} style={{ width: 22, height: 16 }} contentFit="contain" />}
              onPress={() => router.push('/ticket-vault')}
            />
          }
        />
        <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search events" />
        <CategoryFilter options={categories} selectedId={selectedCategory} onSelect={setSelectedCategory} />
      </View>

      {loading && <Text style={sectionTitle}>Loading…</Text>}

      <View style={{ gap: wuzyLayout.itemGap }}>
        <Text style={sectionTitle}>Today</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          style={{ marginHorizontal: -wuzyLayout.side }}
          contentContainerStyle={{ paddingHorizontal: wuzyLayout.side, gap: wuzyLayout.itemGap }}>
          {featured.map((event) => (
            <FeaturedEventCard
              key={event.id}
              event={{
                id: String(event.id),
                title: event.title,
                time: eventTime(event.start_time),
                location: event.location ?? event.venue ?? '',
                price: event.price ?? 'Free',
                imageUri: { uri: assetUrl(event.image_url ?? '') },
                tagLabel: TAG_BY_REASON[event.reason] ?? 'Discover',
                category: event.category,
              }}
              onVisit={() => {
                void going(event.id);
                router.push({ pathname: '/event-details', params: { id: String(event.id) } });
              }}
            />
          ))}
        </ScrollView>
      </View>

      <View style={{ gap: wuzyLayout.itemGap }}>
        <Text style={sectionTitle}>Up coming</Text>
        {upcoming.map((event) => (
          <UpcomingEventCard
            key={event.id}
            event={{
              id: String(event.id),
              title: event.title,
              hostName: event.host_name ?? 'Wuzy',
              hostAvatar: { uri: assetUrl(event.host_avatar_url ?? '') },
              dateDay: String(new Date(event.start_time).getDate()),
              dateMonth: new Date(event.start_time).toLocaleString('en-US', { month: 'short' }).toUpperCase(),
              imageUri: { uri: assetUrl(event.image_url ?? '') },
              category: event.category,
            }}
            onPress={() => {
              void going(event.id);
              router.push({ pathname: '/event-details', params: { id: String(event.id) } });
            }}
          />
        ))}
      </View>

      <Text
        className="text-center"
        style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.gray, paddingVertical: wuzyLayout.gap }}>
        You are all caught up
      </Text>
    </Screen>
  );
}
