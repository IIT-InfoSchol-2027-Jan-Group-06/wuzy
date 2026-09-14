import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ImageSourcePropType, Modal, Text, View } from 'react-native';

import { CategoryFilter } from '@/components/CategoryFilter';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { GlassNavButton } from '@/components/GlassNavButton';
import { ReferralNotificationCard } from '@/components/ReferralNotificationCard';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { UserRow } from '@/components/UserRow';
import { notifications, type Notification } from '@/constants/notification-data';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';
import { assetUrl, getInboxReferrals, relativeTime, respondReferral, type ApiReferralRequest } from '@/lib/api';
import { getUnreadNotifications } from '@/lib/chat-db';
import { acquireChat, subscribeChat, subscribeReferrals } from '@/lib/ws';

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

type RecipientStatus = 'pending' | 'accepted' | 'declined';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | number>('all');
  const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([]);
  const [referrals, setReferrals] = useState<ApiReferralRequest[]>([]);
  const [pendingConfirm, setPendingConfirm] = useState<{ request: ApiReferralRequest; accept: boolean } | null>(null);
  // The resolution popup: the yellow message text, shown until tapped away.
  const [popup, setPopup] = useState<string | null>(null);
  // Referrals whose resolution popup has already shown this session, so the
  // same outcome never pops twice across refetches and live frames.
  const shownPopups = useRef(new Set<number>());

  const myId = user?.id;

  /** My own reply in a referral: recipient ids are stored sorted. */
  const myStatus = useCallback(
    (r: ApiReferralRequest): RecipientStatus =>
      (r.first_user_id === myId ? r.first_status : r.second_status) as RecipientStatus,
    [myId],
  );

  /** The other recipient's full name, who my notification forwards to. */
  const otherNameFor = useCallback(
    (r: ApiReferralRequest): string | null =>
      r.first_user_id === myId ? r.second_name : r.first_name,
    [myId],
  );

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

  const refreshReferrals = useCallback(async () => {
    try {
      const rows = await getInboxReferrals();
      // A referral that fully resolved shows its outcome popup once, then the
      // row is dropped from the list by the pending-only filter below.
      for (const r of rows) {
        if (r.status === 'accepted' || r.status === 'declined') {
          if (shownPopups.current.has(r.id)) continue;
          shownPopups.current.add(r.id);
          const other = otherNameFor(r);
          setPopup(r.status === 'accepted' ? `Connection made with ${other ?? 'them'}!` : 'Referral Denied!');
        }
      }
      setReferrals(rows);
    } catch {
      setReferrals([]);
    }
  }, [otherNameFor]);

  const resolveReferral = useCallback(
    async (request: ApiReferralRequest, accept: boolean) => {
      try {
        const updated = await respondReferral(request.id, accept);
        // Swap the row in place so the card flips to the waiting note, or pops
        // the outcome if this reply resolved the whole referral.
        setReferrals((rows) => rows.map((r) => (r.id === updated.id ? updated : r)));
        if (updated.status === 'accepted' || updated.status === 'declined') {
          if (!shownPopups.current.has(updated.id)) {
            shownPopups.current.add(updated.id);
            const other = otherNameFor(updated);
            setPopup(
              updated.status === 'accepted'
                ? `Connection made with ${other ?? 'them'}!`
                : 'Referral Denied!',
            );
          }
        }
      } catch (error) {
        console.error('[notifications] referral response failed', error);
      }
      refreshReferrals();
    },
    [refreshReferrals, otherNameFor],
  );

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      // Open the shared chat socket while notifications are on screen so new
      // messages and referrals land here live; incoming frames refresh the lists.
      const release = acquireChat(user.id);
      const unsubscribe = subscribeChat(() => {
        refreshMessages();
      });
      const unsubscribeReferrals = subscribeReferrals(() => {
        refreshReferrals();
      });
      refreshMessages();
      refreshReferrals();
      return () => {
        unsubscribeReferrals();
        unsubscribe();
        release();
      };
    }, [user, refreshMessages, refreshReferrals]),
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
        const pendingReferrals = key === 'new' ? referrals.filter((r) => r.status === 'pending') : [];
        const showReferrals = pendingReferrals.length > 0;
        if (items.length === 0 && !showLive && !showReferrals) return null;
        return (
          <View key={key} style={{ gap: wuzyLayout.itemGap }}>
            <Text className="text-wuzy-yellow" style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.section }}>
              {title}
            </Text>
            {showReferrals &&
              pendingReferrals.map((r) => {
                const mine = myStatus(r);
                const other = otherNameFor(r) ?? 'a friend';
                // Once I replied, that side is locked: the pills disappear and
                // the card shows the yellow note while the other side decides.
                const canRespond = mine === 'pending';
                return (
                  <ReferralNotificationCard
                    key={`referral-${r.id}`}
                    avatar={r.sender_avatar_url ? { uri: assetUrl(r.sender_avatar_url) } : defaultAvatar}
                    senderName={r.sender_name ?? 'Someone'}
                    otherName={other}
                    timestamp={relativeTime(r.created_at)}
                    waitingName={mine === 'accepted' ? other : undefined}
                    onAccept={canRespond ? () => setPendingConfirm({ request: r, accept: true }) : undefined}
                    onDecline={canRespond ? () => setPendingConfirm({ request: r, accept: false }) : undefined}
                  />
                );
              })}
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

      <ConfirmDialog
        visible={pendingConfirm !== null}
        title={pendingConfirm?.accept ? 'Accept Referral?' : 'Decline Referral?'}
        message={
          pendingConfirm
            ? `${pendingConfirm.accept ? 'Accept' : 'Decline'} the referral from ${
                pendingConfirm.request.sender_name ?? 'this person'
              } to connect with ${otherNameFor(pendingConfirm.request) ?? 'them'}?`
            : ''
        }
        confirmLabel={pendingConfirm?.accept ? 'Accept' : 'Decline'}
        onCancel={() => setPendingConfirm(null)}
        onConfirm={() => {
          if (!pendingConfirm) return;
          setPendingConfirm(null);
          resolveReferral(pendingConfirm.request, pendingConfirm.accept);
        }}
      />

      {/* Outcome popup: the whole message is one yellow line, no subtitle, with
          a single OK pill. Same box shape as ConfirmDialog but only one action. */}
      <Modal transparent visible={popup !== null} animationType="fade" onRequestClose={() => setPopup(null)}>
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View
            style={{
              width: 300,
              borderRadius: 20,
              padding: 20,
              gap: 14,
              backgroundColor: 'rgba(24, 24, 24, 0.92)',
              borderWidth: 1,
              borderColor: 'rgba(255, 231, 131, 0.12)',
            }}>
            <Text
              style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body, color: wuzyColors.yellow, textAlign: 'center' }}>
              {popup}
            </Text>
            <GlassNavButton
              onPress={() => setPopup(null)}
              style={{ width: 120, height: wuzyLayout.control, alignSelf: 'center' }}>
              <Text
                style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.yellow, textAlign: 'center' }}>
                OK
              </Text>
            </GlassNavButton>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}