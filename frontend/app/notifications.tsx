import { useState } from 'react';
import { Text, View } from 'react-native';

import { CategoryFilter } from '@/components/CategoryFilter';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { UserRow } from '@/components/UserRow';
import { notifications, type Notification } from '@/constants/notification-data';
import { wuzyFonts, wuzyLayout } from '@/constants/wuzy-theme';
import { useResponsive } from '@/hooks/useResponsive';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'events', label: 'Events' },
  { id: 'requests', label: 'Requests' },
];

const groups: { key: Notification['group']; title: string }[] = [
  { key: 'new', title: 'New' },
  { key: 'past', title: 'Past' },
];

export default function NotificationsScreen() {
  const { fontSize } = useResponsive();
  const [selectedCategory, setSelectedCategory] = useState<string | number>('all');

  const visible =
    selectedCategory === 'all' ? notifications : notifications.filter((n) => n.category === selectedCategory);

  return (
    <Screen scroll style={{ gap: wuzyLayout.gap }}>
      <ScreenHeader title="Notifications" />

      <CategoryFilter options={categories} selectedId={selectedCategory} onSelect={setSelectedCategory} />

      {groups.map(({ key, title }) => {
        const items = visible.filter((n) => n.group === key);
        if (items.length === 0) return null;
        return (
          <View key={key} style={{ gap: wuzyLayout.itemGap }}>
            <Text className="text-wuzy-yellow" style={{ fontFamily: wuzyFonts.semibold, fontSize: fontSize('section') }}>
              {title}
            </Text>
            {items.map((n) => (
              <UserRow key={n.id} avatar={n.avatar} name={n.name} label={n.label} timestamp={n.timestamp} />
            ))}
          </View>
        );
      })}
    </Screen>
  );
}
