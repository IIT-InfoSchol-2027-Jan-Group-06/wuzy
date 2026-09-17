import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ConnectionList } from '@/components/ConnectionList';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import type { Connection } from '@/constants/connection-data';
import { wuzyLayout } from '@/constants/wuzy-theme';
import { useConnections } from '@/hooks/useConnections';

/** Pick a connection and gift them tickets to the event in `id`. Tapping a
 *  card confirms, then the gift frame opens (same as buying, but addressed to
 *  that connection and sent as a chat message instead of kept). */
export default function GiftTicketScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { connections, loading } = useConnections();
  const [pending, setPending] = useState<Connection | null>(null);

  return (
    <Screen style={{ gap: wuzyLayout.gap }}>
      <ScreenHeader title="Gift a ticket" />
      <ConnectionList
        connections={connections}
        loading={loading}
        emptyLabel="Connect with someone to gift them a ticket"
        showCount={false}
        onCardPress={(c) => setPending(c)}
      />
      <ConfirmDialog
        visible={pending !== null}
        title="Gift a ticket?"
        message={pending ? `Gift tickets for this event to ${pending.name}?` : ''}
        confirmLabel="Yes, gift"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (!pending) return;
          const target = pending;
          setPending(null);
          router.push({ pathname: '/ticket', params: { id, mode: 'gift', to: target.id } });
        }}
      />
    </Screen>
  );
}