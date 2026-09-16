import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConnectionCard } from '@/components/ConnectionCard';
import { wuzyLayout } from '@/constants/wuzy-theme';
import type { Connection } from '@/constants/connection-data';

interface ConnectionCardPopupProps {
  /** The connection whose card is open; null hides the popup. */
  connection: Connection | null;
  /** Fired on an outside tap, the avatar, or the Android back affordance. */
  onClose: () => void;
  /** Wired to the open card's "Go to profile" button. */
  onProfilePress?: () => void;
  /** Wired to the open card's "Refer to a friend" button. */
  onReferPress?: () => void;
  /** Rendered inside the open card instead of the action buttons. */
  expandedContent?: ReactNode;
}

/** Full-frame dim overlay with the expanded `ConnectionCard` centered. It lives
  * inside the route (not a native Modal) so a pushed screen covers it and returning
  * reveals it still open; only an outside tap (or the avatar) dismisses it. The
  * dim bleeds past the safe-area insets so it covers the whole device frame edge
  * to edge. */
export function ConnectionCardPopup({
  connection,
  onClose,
  onProfilePress,
  onReferPress,
  expandedContent,
}: ConnectionCardPopupProps) {
  const insets = useSafeAreaInsets();
  if (!connection) return null;

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          top: -insets.top,
          bottom: -insets.bottom,
          zIndex: 200,
          elevation: 200,
        },
      ]}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: wuzyLayout.side,
          paddingVertical: 40,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
        <Pressable onPress={() => {}} style={{ width: '100%' }}>
          <ConnectionCard
            connection={connection}
            expanded
            onAvatarPress={onClose}
            onProfilePress={onProfilePress}
            onReferPress={onReferPress}
            expandedContent={expandedContent}
          />
        </Pressable>
      </Pressable>
    </View>
  );
}