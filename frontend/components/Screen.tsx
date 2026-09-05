import type { ReactNode } from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';

import { useNavBarMetrics } from '@/components/NavBar';
import { wuzyLayout } from '@/constants/wuzy-theme';

type Props = {
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  overlay?: ReactNode;
  children: ReactNode;
};

/** Shell for every route: bg, safe area, 12 top, 32 sides (padded), a phone-width column on wide screens. scroll = ScrollView that clears the NavBar on tab screens. overlay = floating controls above the content. */
export function Screen({ scroll, padded = true, style, overlay, children }: Props) {
  // Per-instance: the navigator that owns this screen, not the globally focused route.
  const isTab = useNavigation().getState()?.type === 'tab';
  const { clearance } = useNavBarMetrics();
  const pad = { paddingTop: wuzyLayout.top, paddingHorizontal: padded ? wuzyLayout.side : 0 };

  return (
    <SafeAreaView edges={isTab ? ['top'] : ['top', 'bottom']} className="flex-1 bg-wuzy-bg">
      <View className="flex-1">
        {scroll ? (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[pad, { paddingBottom: isTab ? clearance : wuzyLayout.gap }, style]}>
            {children}
          </ScrollView>
        ) : (
          <View className="flex-1" style={[pad, style]}>
            {children}
          </View>
        )}
        {overlay}
      </View>
    </SafeAreaView>
  );
}
