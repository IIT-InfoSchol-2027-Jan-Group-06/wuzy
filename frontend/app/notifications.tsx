import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ImageSourcePropType, Text, View } from 'react-native';

import { CategoryFilter } from '@/components/CategoryFilter';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { UserRow } from '@/components/UserRow';
import { notifications, type Notification } from '@/constants/notification-data';
import { wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';
import { relativeTime } from '@/lib/api';
import { getUnreadNotifications } from '@/lib/chat-db';
import { acquireChat, subscribeChat } from '@/lib/ws';

const defaultAvatar = require('@/assets/images/avatar1.jpg');

const categories = [
  { id: 'all', label: 'All' },
  { id: 'messages', label: 'Messages' },
  { id: 'events', label: 'Events' },
  { id: 'requests', label: 'Requests' },
];

const groups: { key: Notification['group']; title: string }[] = [
  { key: 'new', title: 'New' },
  { key: 'past', title: 'Past' },
];

/** A live "new message" notification, keyed by thread so updates replace each other. */
type LiveMessage = {
  key: string;
  avatar: ImageSourcePropType;
  name: string;
  label: string;
  timestamp: string;
};

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | number>('all');
  const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([]);

  const refreshMessages = useCallback(async () => {
    if (!user) return;
    const rows = await getUnreadNotifications(user.id);
    setLiveMessages(
      rows.map((r) => ({
        key: `${r.kind}-${r.thread_id}`,
        avatar: defaultAvatar,
        name: r.from_name ?? 'New message',
        label: r.text,
        timestamp: relativeTime(r.created_at),
      })),
    );
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      // Open the shared chat socket while notifications are on screen so new
      // messages land here live; incoming frames refresh the list.
      const release = acquireChat(user.id);
      const unsubscribe = subscribeChat(() => {
        refreshMessages();
      });
      refreshMessages();
      return () => {
        unsubscribe();
        release();
      };
    }, [user, refreshMessages]),
  );

  const visible =
    selectedCategory === 'all' ? notifications : notifications.filter((n) => n.category === selectedCategory);

  return (
    <Screen scroll style={{ gap: wuzyLayout.gap }}>
      <View style={{ gap: wuzyLayout.gap }}>
        <ScreenHeader title="Notifications" />
        <CategoryFilter options={categories} selectedId={selectedCategory} onSelect={setSelectedCategory} />
      </View>

      {groups.map(({ key, title }) => {
        const items = visible.filter((n) => n.group === key);
        const showLive = key === 'new' && liveMessages.length > 0;
        if (items.length === 0 && !showLive) return null;
        return (
          <View key={key} style={{ gap: wuzyLayout.itemGap }}>
            <Text className="text-wuzy-yellow" style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.section }}>
              {title}
            </Text>
            {showLive &&
              liveMessages.map((m) => (
                <UserRow key={m.key} avatar={m.avatar} name={m.name} label={m.label} timestamp={m.timestamp} />
              ))}
            {items.map((n) => (
              <UserRow key={n.id} avatar={n.avatar} name={n.name} label={n.label} timestamp={n.timestamp} />
            ))}
          </View>
        );
      })}
    </Screen>
  );
}