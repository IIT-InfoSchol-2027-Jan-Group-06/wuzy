import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

export type NavBarItem = 'home' | 'chat' | 'medals' | 'events' | 'profile';

type NavBarProps = {
  active?: NavBarItem;
  onItemPress?: (item: NavBarItem) => void;
};

const NAV_ITEMS: { key: NavBarItem; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'chat', label: 'Chats', icon: 'chatbubble-ellipses' },
  { key: 'medals', label: 'Medals', icon: 'medal' },
  { key: 'events', label: 'Events', icon: 'sparkles' },
  { key: 'profile', label: 'Profile', icon: 'person-circle' },
];

export function NavBar({ active = 'home', onItemPress }: NavBarProps) {
  // Size scales with the screen: width is 92% of the device width, height and
  // icons stay proportional so the bar looks the same on any phone.
  const { width: screenWidth } = useWindowDimensions();
  const barWidth = Math.round(screenWidth * 0.72);
  const barHeight = Math.round(barWidth * (50 / 290));
  const iconSize = Math.round(barHeight * 0.52);

  return (
    <View className="pointer-events-box-none absolute inset-x-0 bottom-8 items-center">
      <View
        className="overflow-hidden rounded-full border border-white/20 bg-[#F4C400]/10 shadow-lg shadow-black/40"
        style={{ width: barWidth, height: barHeight }}>
        <BlurView
          intensity={80}
          tint="dark"
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
        <View className="flex-1 flex-row items-center justify-between px-6">
          {NAV_ITEMS.map((item) => {
            return (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() => onItemPress?.(item.key)}
                className="items-center justify-center rounded-full active:scale-90"
                style={{ width: barHeight * 0.8, height: barHeight * 0.8 }}>
                <Ionicons name={item.icon} size={iconSize} color="#ffffff" />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}