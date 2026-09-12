import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { ConnectionList } from '@/components/ConnectionList';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { wuzyLayout } from '@/constants/wuzy-theme';
import { useConnections } from '@/hooks/useConnections';

export default function ConnectionsScreen() {
  const router = useRouter();
  const { connections, loading } = useConnections();

  return (
    <Screen>
      <View style={{ flex: 1, gap: wuzyLayout.itemGap }}>
        <ScreenHeader title="Connections" />
        <ConnectionList
          connections={connections}
          loading={loading}
          emptyLabel="No connections yet"
          onProfilePress={(c) => router.push(`/profile/${c.id}`)}
          onReferPress={(c) => router.push({ pathname: '/refer-friend', params: { id: c.id, name: c.name } })}
        />
      </View>
    </Screen>
  );
}