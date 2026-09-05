import type { ReactNode } from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSegments } from 'expo-router';

import { useNavBarMetrics } from '@/components/NavBar';
import { wuzyLayout } from '@/constants/wuzy-theme';

type Props = {
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  fab?: ReactNode;
  children: ReactNode;
};

/** Shell for every route: bg, safe area, 12 top. padded = 32 sides. scroll = ScrollView that clears the NavBar on tab screens. */
export function Screen({ scroll, padded = true, style, fab, children }: Props) {
  const isTab = useSegments()[0] === '(tabs)';
  const { clearance } = useNavBarMetrics();
  const pad = { paddingTop: wuzyLayout.top, paddingHorizontal: padded ? wuzyLayout.side : 0 };

  return (
    <SafeAreaView edges={isTab ? ['top'] : ['top', 'bottom']} className="flex-1 bg-wuzy-bg">
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
      {fab}
    </SafeAreaView>
  );
}
