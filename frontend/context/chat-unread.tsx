import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useAuth } from '@/context/auth';
import { getUnreadTotal, markThreadRead as markThreadReadInDb, type ThreadKind } from '@/lib/chat-db';
import { subscribeChat } from '@/lib/ws';

type ChatUnreadContextValue = {
  /** Badge count: unread incoming messages across every thread. */
  total: number;
  refresh: () => Promise<void>;
  /** Mark one thread read and refresh the badge count. */
  markThreadRead: (kind: ThreadKind, threadId: number) => Promise<void>;
};

const ChatUnreadContext = createContext<ChatUnreadContextValue | null>(null);

export function ChatUnreadProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [total, setTotal] = useState(0);

  const refresh = useCallback(async () => {
    setTotal(user ? await getUnreadTotal(user.id) : 0);
  }, [user]);

  // Recompute whenever a fresh message lands on the shared socket, or when the
  // user changes (login/logout).
  useEffect(() => {
    refresh();
    return subscribeChat(() => {
      refresh();
    });
  }, [refresh]);

  const markThreadRead = useCallback(
    async (kind: ThreadKind, threadId: number) => {
      if (!user) return;
      await markThreadReadInDb(user.id, kind, threadId);
      await refresh();
    },
    [user, refresh],
  );

  const value = useMemo(() => ({ total, refresh, markThreadRead }), [total, refresh, markThreadRead]);
  return <ChatUnreadContext.Provider value={value}>{children}</ChatUnreadContext.Provider>;
}

export function useChatUnread() {
  const ctx = useContext(ChatUnreadContext);
  if (!ctx) throw new Error('useChatUnread must be used inside ChatUnreadProvider');
  return ctx;
}