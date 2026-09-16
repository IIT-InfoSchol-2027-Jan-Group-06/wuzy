import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ConnectionList } from '@/components/ConnectionList';
import { GlassNavButton } from '@/components/GlassNavButton';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import type { Connection } from '@/constants/connection-data';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { useConnections } from '@/hooks/useConnections';
import { apiGiftTicket } from '@/lib/api';

/** Pick a connection and send them a ticket for the event in `id`. */
export default function GiftTicketScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { connections, loading } = useConnections();
  const [pending, setPending] = useState<Connection | null>(null);
  const [giftedId, setGiftedId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  // The "Gifted!" flash shows for a second, then the screen closes itself.
  useEffect(() => {
    if (!giftedId) return;
    const timer = setTimeout(() => router.back(), 1000);
    return () => clearTimeout(timer);
  }, [giftedId, router]);

  useEffect(() => {
    if (!note) return;
    const timer = setTimeout(() => setNote(null), 2000);
    return () => clearTimeout(timer);
  }, [note]);

  const send = async (connection: Connection) => {
    try {
      await apiGiftTicket(Number(connection.id), Number(id));
      setGiftedId(connection.id);
    } catch (err) {
      setNote(err instanceof Error ? err.message : 'Could not send the ticket');
    }
  };

  return (
    <Screen style={{ gap: wuzyLayout.gap }}>
      <ScreenHeader title="Gift a ticket" />
      <ConnectionList
        connections={connections}
        loading={loading}
        emptyLabel="Connect with someone to gift them a ticket"
        showCount={false}
        expandedContent={(c) => (
          <View style={{ marginTop: 35, alignItems: 'center' }}>
            {giftedId === c.id || note ? (
              <Text numberOfLines={2} style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.yellow, textAlign: 'center' }}>
                {giftedId === c.id ? 'Gifted!' : note}
              </Text>
            ) : (
              <GlassNavButton
                onPress={() => setPending(c)}
                accessibilityLabel={`Send a ticket to ${c.name}`}
                style={{ width: 200, height: wuzyLayout.control, alignSelf: 'center' }}>
                <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.yellow }}>
                  Send ticket
                </Text>
              </GlassNavButton>
            )}
          </View>
        )}
      />
      <ConfirmDialog
        visible={pending !== null}
        title="Gift a ticket?"
        message={pending ? `Send a ticket for this event to ${pending.name}?` : ''}
        confirmLabel="Send"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (!pending) return;
          const target = pending;
          setPending(null);
          send(target);
        }}
      />
    </Screen>
  );
}
