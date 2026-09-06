import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { wuzyLayout } from '@/constants/wuzy-theme';

export type NavBarItem = 'home' | 'events' | 'awards' | 'chat' | 'profile';

type NavBarProps = {
  active?: NavBarItem;
  onItemPress?: (item: NavBarItem) => void;
};

const NAV_ITEMS: { key: NavBarItem; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'events', label: 'Events', icon: 'sparkles' },
  { key: 'awards', label: 'Awards', icon: 'medal' },
  { key: 'chat', label: 'Chat', icon: 'chatbubble-ellipses' },
  { key: 'profile', label: 'Profile', icon: 'person-circle' },
];

/** NavBar geometry, shared with anything that must clear it (Fab, scroll padding). */
export function useNavBarMetrics() {
  const { width } = useWindowDimensions();
  const { bottom: inset } = useSafeAreaInsets();
  const barWidth = Math.min(Math.round(width * 0.72), 300);
  const height = wuzyLayout.control;
  const bottom = Math.max(wuzyLayout.navBottom, inset + 12);
  return { barWidth, height, bottom, clearance: bottom + height + 16 };
}

export function NavBar({ active = 'home', onItemPress }: NavBarProps) {
  const { barWidth, height, bottom } = useNavBarMetrics();
  const iconSize = Math.round(height * 0.52);

  return (
    <View className="pointer-events-box-none absolute inset-x-0 items-center" style={{ bottom }}>
      <View
        className="overflow-hidden rounded-full border border-white/20 bg-[#F4C400]/10 shadow-lg shadow-black/40"
        style={{ width: barWidth, height }}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
        <View className="flex-1 flex-row items-center justify-between px-6">
          {NAV_ITEMS.map((item) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: item.key === active }}
              onPress={() => onItemPress?.(item.key)}
              className="items-center justify-center rounded-full active:scale-90"
              style={{ width: height, height }}>
              <Ionicons name={item.icon} size={iconSize} color="#ffffff" />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
