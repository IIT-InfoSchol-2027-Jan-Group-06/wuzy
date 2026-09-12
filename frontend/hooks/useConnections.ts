import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { toConnection, type Connection } from '@/constants/connection-data';
import { apiGet, type ApiPerson } from '@/lib/api';

/** Fetches the signed-in user's connections (mutual follows) whenever the screen gains focus. */
export function useConnections() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const people = await apiGet<ApiPerson[]>('/chat/people');
      setConnections(people.map((p) => toConnection(p.user)));
    } catch {
      setConnections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { connections, loading, reload };
}