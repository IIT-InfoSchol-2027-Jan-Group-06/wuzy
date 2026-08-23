import { useState } from 'react';
import { Image, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { CategoryFilter } from '@/components/CategoryFilter';
import { GlassNavButton } from '@/components/GlassNavButton';
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
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState<string | number>('all');
  const backButtonSize = Math.round((42 / 375) * screenWidth);

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
          <View className="px-[32px] pt-[49px]">
            <View className="flex-row items-center">
              <GlassNavButton icon="arrow-back" size={backButtonSize} onPress={() => router.back()} />
              <Text
                className="flex-1 text-center text-wuzy-yellow"
                style={{ fontFamily: wuzyFonts.display, fontSize: Math.round(screenWidth * 0.061) }}>
                Notifications
              </Text>
              {/* spacer keeps the title centered against the back button */}
              <View style={{ width: backButtonSize }} />
            </View>
          </View>

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
                      <View key={n.id} className="flex-row items-center gap-[13px]">
                        <Image
                          source={n.avatar}
                          style={{ width: 48, height: 48, borderRadius: 24 }}
                          resizeMode="cover"
                        />
                        <View>
                          <Text style={{ fontFamily: wuzyFonts.medium, fontSize: 15, color: '#999999' }}>
                            {n.label}{'  '}
                            <Text style={{ color: '#FFFFFF' }}>{n.name}</Text>
                          </Text>
                          <Text style={{ fontFamily: wuzyFonts.medium, fontSize: 12, color: '#858585' }}>
                            {n.timestamp}
                          </Text>
                        </View>
                      </View>
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
