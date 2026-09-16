import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { ConnectionCardPopup } from '@/components/ConnectionCardPopup';
import { ConnectionList } from '@/components/ConnectionList';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { wuzyLayout } from '@/constants/wuzy-theme';
import { useConnections } from '@/hooks/useConnections';

export default function ConnectionsScreen() {
  const router = useRouter();
  const { connections, loading } = useConnections();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const expandedConnection = expandedId ? (connections.find((c) => c.id === expandedId) ?? null) : null;

  return (
    <Screen
      overlay={
        <ConnectionCardPopup
          connection={expandedConnection}
          onClose={() => setExpandedId(null)}
          onProfilePress={expandedConnection ? () => router.push(`/profile/${expandedConnection.id}`) : undefined}
          onReferPress={
            expandedConnection
              ? () =>
                  router.push({
                    pathname: '/refer-friend',
                    params: { id: expandedConnection.id, name: expandedConnection.name },
                  })
              : undefined
          }
        />
      }>
      <View style={{ flex: 1, gap: wuzyLayout.itemGap }}>
        <ScreenHeader title="Connections" />
        <ConnectionList
          connections={connections}
          loading={loading}
          emptyLabel="No connections yet"
          onCardPress={(c) => setExpandedId(c.id)}
        />
      </View>
    </Screen>
  );
}
