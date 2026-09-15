import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useAuth } from '@/context/auth';
import { getNotifications, markNotificationsRead, type ApiNotification } from '@/lib/api';
import { acquireChat, subscribeNotifications } from '@/lib/ws';

/** The signed-in user's notifications, refetched whenever the screen gains focus.
 * With `live`, the shared socket stays open on screen and every incoming
 * `notification` frame triggers a refetch. `newIds` collects every row seen
 * unread during the visit, so marking them read does not move them out of New
 * until the screen is left. */
export function useNotifications({ live = false } = {}) {
  const { user } = useAuth();
  const [items, setItems] = useState<ApiNotification[]>([]);
  const [newIds, setNewIds] = useState<Set<number>>(() => new Set());

  const reload = useCallback(async () => {
    try {
      const rows = await getNotifications();
      setItems(rows);
      setNewIds((prev) => new Set([...prev, ...rows.filter((n) => !n.read_at).map((n) => n.id)]));
    } catch {
      setItems([]);
    }
  }, []);

  /** Server-side only; local rows keep their read_at until the next reload. */
  const markAllRead = useCallback(() => markNotificationsRead().catch(() => {}), []);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      reload();
      const release = live ? acquireChat(user.id) : null;
      const unsubscribe = live ? subscribeNotifications(() => reload()) : null;
      return () => {
        unsubscribe?.();
        release?.();
        setNewIds(new Set());
      };
    }, [user, live, reload]),
  );

  const unread = items.filter((n) => !n.read_at).length;
  return { items, newIds, unread, reload, markAllRead };
}
