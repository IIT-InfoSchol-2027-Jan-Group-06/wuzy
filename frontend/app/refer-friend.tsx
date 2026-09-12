import { useMemo } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ConnectionList } from '@/components/ConnectionList';
import { ReferAction } from '@/components/ReferAction';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { wuzyLayout } from '@/constants/wuzy-theme';
import { useConnections } from '@/hooks/useConnections';

export default function ReferFriendScreen() {
  // The person being referred: excluded from the list and named in the sent-request note.
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>();
  const { connections, loading } = useConnections();

  const referable = useMemo(() => connections.filter((c) => c.id !== id), [connections, id]);

  return (
    <Screen>
      <View style={{ flex: 1, gap: wuzyLayout.itemGap }}>
        <ScreenHeader title="Refer to :" />
        <ConnectionList
          connections={referable}
          loading={loading}
          emptyLabel="No connections to refer to"
          showCount={false}
          expandedContent={<ReferAction name={name ?? ''} />}
        />
      </View>
    </Screen>
  );
}