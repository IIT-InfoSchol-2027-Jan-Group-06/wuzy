import { useCallback, useEffect, useState } from 'react';

import { ApiPost, apiGet } from '@/lib/api';

// Demo user id until real auth exists (matches seeded "lana_rae", id 1)
export const CURRENT_USER_ID = 1;

export function useFeed() {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGet<ApiPost[]>('/feed/discover', CURRENT_USER_ID);
      setPosts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { posts, loading, error, refresh };
}
