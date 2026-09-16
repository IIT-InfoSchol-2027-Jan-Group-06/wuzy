import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { apiClaimQuest, apiGetQuestDashboard, type ApiQuestDashboard } from '@/lib/api';

/** The quest dashboard: one fetch per focus, and claims that swap the whole
 * payload at once. `previous` is the dashboard before the last change, so the
 * screen can animate only what moved (rank, new stickers) and never on load. */
export function useQuests() {
  const [dashboard, setDashboard] = useState<ApiQuestDashboard | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);
  const current = useRef<ApiQuestDashboard | null>(null);
  const previous = useRef<ApiQuestDashboard | null>(null);

  const apply = useCallback((next: ApiQuestDashboard) => {
    previous.current = current.current;
    current.current = next;
    setDashboard(next);
  }, []);

  const reload = useCallback(async () => {
    try {
      apply(await apiGetQuestDashboard());
    } catch {
      // Keep whatever is on screen; the next focus retries.
    }
  }, [apply]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      apiGetQuestDashboard()
        .then((d) => {
          if (active) apply(d);
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, [apply]),
  );

  const claim = useCallback(
    async (key: string) => {
      setClaiming(key);
      try {
        const next = await apiClaimQuest(key);
        apply(next);
        return next;
      } finally {
        setClaiming(null);
      }
    },
    [apply],
  );

  return { dashboard, previous: previous.current, loaded: dashboard !== null, claiming, claim, reload };
}
