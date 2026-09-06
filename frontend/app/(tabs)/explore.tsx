import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';

import { CategoryFilter } from '@/components/CategoryFilter';
import { FeaturedEventCard } from '@/components/events/FeaturedEventCard';
import { UpcomingEventCard } from '@/components/events/UpcomingEventCard';
import { GlassNavButton } from '@/components/GlassNavButton';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { exploreCategories, featuredEvents, upcomingEvents } from '@/constants/event-data';
import { wuzyColors, wuzyFonts, wuzyLayout } from '@/constants/wuzy-theme';
import { useResponsive } from '@/hooks/useResponsive';

export default function ExploreScreen() {
  const router = useRouter();
  const { fontSize } = useResponsive();
  const [selectedCategory, setSelectedCategory] = useState<string | number>('all');
  const [searchText, setSearchText] = useState('');

  const q = searchText.trim().toLowerCase();
  const inCategory = (category: string) => selectedCategory === 'all' || category === selectedCategory;
  const featured = featuredEvents.filter(
    (e) => inCategory(e.category) && (!q || [e.title, e.location, e.tagLabel].some((s) => s.toLowerCase().includes(q))),
  );
  const upcoming = upcomingEvents.filter(
    (e) => inCategory(e.category) && (!q || [e.title, e.hostName].some((s) => s.toLowerCase().includes(q))),
  );

  const sectionTitle = { fontFamily: wuzyFonts.semibold, fontSize: fontSize('section'), color: wuzyColors.yellow };

  return (
    <Screen scroll style={{ gap: wuzyLayout.gap }}>
      <View style={{ gap: wuzyLayout.itemGap }}>
        <View className="flex-row items-center justify-between">
          <Text
            className="text-wuzy-yellow"
            style={{ fontFamily: wuzyFonts.display, fontSize: fontSize('display'), lineHeight: fontSize('display') }}>
            Explore
          </Text>
          <GlassNavButton
            accessibilityLabel="Tickets"
            icon={<Image source={require('@/assets/icons/ticket.svg')} style={{ width: 22, height: 16 }} contentFit="contain" />}
            onPress={() => router.push('/ticket-vault')}
          />
        </View>
        <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search events" />
        <CategoryFilter options={exploreCategories} selectedId={selectedCategory} onSelect={setSelectedCategory} />
      </View>

      <View style={{ gap: wuzyLayout.itemGap }}>
        <Text style={sectionTitle}>Today</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          style={{ marginHorizontal: -wuzyLayout.side }}
          contentContainerStyle={{ paddingHorizontal: wuzyLayout.side, gap: wuzyLayout.itemGap }}>
          {featured.map((event) => (
            <FeaturedEventCard key={event.id} event={event} onVisit={() => router.push('/event-details')} />
          ))}
        </ScrollView>
      </View>

      <View style={{ gap: wuzyLayout.itemGap }}>
        <Text style={sectionTitle}>Up coming</Text>
        {upcoming.map((event) => (
          <UpcomingEventCard key={event.id} event={event} onPress={() => router.push('/event-details')} />
        ))}
      </View>

      <Text
        className="text-center"
        style={{ fontFamily: wuzyFonts.body, fontSize: fontSize('small'), color: wuzyColors.gray, paddingVertical: wuzyLayout.gap }}>
        You are all caught up
      </Text>
    </Screen>
  );
}
