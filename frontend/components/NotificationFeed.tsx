import { useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryFilter } from '@/components/CategoryFilter';
import { ScreenHeader } from '@/components/ScreenHeader';
import { UserRow } from '@/components/UserRow';
import { notifications, type Notification } from '@/constants/notification-data';
import { wuzyFonts } from '@/constants/wuzy-theme';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'events', label: 'Events' },
  { id: 'requests', label: 'Requests' },
];

const groups: { key: Notification['group']; title: string }[] = [
  { key: 'new', title: 'New' },
  { key: 'past', title: 'Past' },
];

export function NotificationFeed() {
  const { width: screenWidth } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState<string | number>('all');

  const visible =
    selectedCategory === 'all'
      ? notifications
      : notifications.filter((n) => n.category === selectedCategory);

  return (
    <View className="flex-1 bg-wuzy-bg">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1" style={{ backgroundColor: '#0A0F17' }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}>
          <ScreenHeader title="Notifications" />

          <CategoryFilter
            options={categories}
            selectedId={selectedCategory}
            onSelect={setSelectedCategory}
            containerStyle={{ marginTop: 16, marginHorizontal: 16 }}
          />

          <View className="px-[32px] mt-[24px] gap-[24px]">
            {groups.map(({ key, title }) => {
              const items = visible.filter((n) => n.group === key);
              if (items.length === 0) return null;
              return (
                <View key={key}>
                  <Text
                    className="mb-[12px] text-wuzy-yellow"
                    style={{ fontFamily: wuzyFonts.semibold, fontSize: Math.round(screenWidth * 0.041) }}>
                    {title}
                  </Text>
                  <View className="gap-[10px]">
                    {items.map((n) => (
                      <UserRow
                        key={n.id}
                        avatar={n.avatar}
                        name={n.name}
                        label={n.label}
                        timestamp={n.timestamp}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
