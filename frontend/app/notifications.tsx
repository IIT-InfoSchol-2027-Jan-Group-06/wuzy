import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ImageSourcePropType, Text, View } from 'react-native';

import { CategoryFilter } from '@/components/CategoryFilter';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { NotificationCard } from '@/components/NotificationCard';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { UserRow } from '@/components/UserRow';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';
import { useNotifications } from '@/hooks/useNotifications';
import { assetUrl, relativeTime, respondReferral, type ApiNotification } from '@/lib/api';
import { getUnreadNotifications } from '@/lib/chat-db';
import { subscribeChat } from '@/lib/ws';

const defaultAvatar = require('@/assets/images/avatar1.jpg');

const categories = [
  { id: 'all', label: 'All' },
  { id: 'messages', label: 'Messages' },
  { id: 'requests', label: 'Requests' },
  { id: 'activity', label: 'Activity' },
];

/** The gray kind label and filter pill for each notification type. */
const kinds: Record<string, { label: string; category: string }> = {
  referral: { label: 'Referral', category: 'requests' },
  referral_response: { label: 'Referral', category: 'requests' },
  referral_declined: { label: 'Referral', category: 'requests' },
  connection: { label: 'Connection', category: 'requests' },
  group: { label: 'Group', category: 'messages' },
  like: { label: 'Like', category: 'activity' },
  gift: { label: 'Gift', category: 'activity' },
};

/** A live "new message" notification, keyed by thread so updates replace each other. */
type LiveMessage = {
  key: string;
  avatar: ImageSourcePropType;
  name: string;
  label: string;
  timestamp: string;
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, newIds, reload, markAllRead } = useNotifications({ live: true });
  const [selectedCategory, setSelectedCategory] = useState<string | number>('all');
  const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([]);
  const [pendingConfirm, setPendingConfirm] = useState<{ row: ApiNotification; accept: boolean } | null>(null);
  // Rows are marked read on the server on focus but stay under New for the visit.
  const isNew = (n: ApiNotification) => newIds.has(n.id);

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
      // useNotifications holds the shared socket open while we are on screen.
      const unsubscribe = subscribeChat(() => {
        refreshMessages();
      });
      refreshMessages();
      markAllRead();
      return () => {
        unsubscribe();
      };
    }, [user, refreshMessages, markAllRead]),
  );

  const resolveReferral = useCallback(
    async (row: ApiNotification, accept: boolean) => {
      if (row.entity_id == null) return;
      try {
        await respondReferral(row.entity_id, accept);
      } catch (error) {
        console.error('[notifications] referral response failed', error);
      }
      reload();
    },
    [reload],
  );

  const visible = items.filter((n) => selectedCategory === 'all' || kinds[n.type]?.category === selectedCategory);
  const showChat = selectedCategory === 'all' || selectedCategory === 'messages';
  const sections = [
    { key: 'new', title: 'New', rows: visible.filter(isNew) },
    { key: 'past', title: 'Past', rows: visible.filter((n) => !isNew(n)) },
  ];
  const chatRows = showChat ? liveMessages : [];
  const empty = visible.length === 0 && chatRows.length === 0;

  const renderRow = (n: ApiNotification) => {
    const kind = kinds[n.type] ?? { label: 'Activity', category: 'activity' };
    const avatar = n.payload.actor_avatar_url ? { uri: assetUrl(n.payload.actor_avatar_url) } : defaultAvatar;
    const isReferral = n.type === 'referral';
    const canRespond = isReferral && n.payload.my_status === 'pending' && n.payload.status === 'pending';
    const waiting = isReferral && n.payload.my_status === 'accepted' && n.payload.status === 'pending';
    return (
      <NotificationCard
        key={n.id}
        avatar={avatar}
        label={kind.label}
        text={n.payload.text}
        timestamp={relativeTime(n.created_at)}
        waitingName={waiting ? (n.payload.other_name ?? 'them') : undefined}
        onAccept={canRespond ? () => setPendingConfirm({ row: n, accept: true }) : undefined}
        onDecline={canRespond ? () => setPendingConfirm({ row: n, accept: false }) : undefined}
        onPress={!isReferral && n.payload.url ? () => router.push(n.payload.url as never) : undefined}
      />
    );
  };

  return (
    <Screen scroll style={{ gap: wuzyLayout.gap }}>
      <View style={{ gap: wuzyLayout.gap }}>
        <ScreenHeader title="Notifications" />
        <CategoryFilter options={categories} selectedId={selectedCategory} onSelect={setSelectedCategory} />
      </View>

      {empty ? (
        <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.small, color: wuzyColors.gray }}>
          Nothing yet. Connections, referrals, messages and likes land here.
        </Text>
      ) : null}

      {sections.map(({ key, title, rows }) => {
        const showChatHere = key === 'new' && chatRows.length > 0;
        if (rows.length === 0 && !showChatHere) return null;
        return (
          <View key={key} style={{ gap: wuzyLayout.itemGap }}>
            <Text className="text-wuzy-yellow" style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.section }}>
              {title}
            </Text>
            {showChatHere &&
              chatRows.map((m) => (
                <UserRow key={m.key} avatar={m.avatar} name={m.name} label={m.label} timestamp={m.timestamp} />
              ))}
            {rows.map(renderRow)}
          </View>
        );
      })}

      <ConfirmDialog
        visible={pendingConfirm !== null}
        title={pendingConfirm?.accept ? 'Accept Referral?' : 'Decline Referral?'}
        message={
          pendingConfirm
            ? `${pendingConfirm.accept ? 'Accept' : 'Decline'} the referral from ${
                pendingConfirm.row.payload.actor_name ?? 'this person'
              } to connect with ${pendingConfirm.row.payload.other_name ?? 'them'}?`
            : ''
        }
        confirmLabel={pendingConfirm?.accept ? 'Accept' : 'Decline'}
        onCancel={() => setPendingConfirm(null)}
        onConfirm={() => {
          if (!pendingConfirm) return;
          setPendingConfirm(null);
          resolveReferral(pendingConfirm.row, pendingConfirm.accept);
        }}
      />
    </Screen>
  );
}
