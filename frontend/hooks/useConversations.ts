import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/context/auth';
import { apiGet, type ApiConversation } from '@/lib/api';

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      setConversations(await apiGet<ApiConversation[]>('/chat/conversations'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { conversations, loading, error, refresh };
}