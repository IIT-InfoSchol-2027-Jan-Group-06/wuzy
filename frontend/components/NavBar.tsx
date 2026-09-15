import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { wuzyColors, wuzyLayout, wuzyFonts, wuzyType } from '@/constants/wuzy-theme';

export type NavBarItem = 'home' | 'events' | 'awards' | 'chat' | 'profile';

type NavBarProps = {
  active?: NavBarItem;
  onItemPress?: (item: NavBarItem) => void;
  chatUnread?: number;
};

const NAV_ITEMS: {
  key: NavBarItem;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  outline: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'home', label: 'Home', icon: 'home', outline: 'home-outline' },
  { key: 'events', label: 'Events', icon: 'sparkles', outline: 'sparkles-outline' },
  { key: 'awards', label: 'Awards', icon: 'medal', outline: 'medal-outline' },
  { key: 'chat', label: 'Chat', icon: 'chatbubble-ellipses', outline: 'chatbubble-ellipses-outline' },
  { key: 'profile', label: 'Profile', icon: 'person-circle', outline: 'person-circle-outline' },
];

/** NavBar geometry, shared with anything that must clear it (Fab, scroll padding). */
export function useNavBarMetrics() {
  const { width } = useWindowDimensions();
  const { bottom: inset } = useSafeAreaInsets();
  const barWidth = Math.round(width * 0.72);
  const height = Math.round(barWidth * (50 / 290));
  const bottom = Math.max(wuzyLayout.navBottom, inset + 12);
  return { barWidth, height, bottom, clearance: bottom + height + 16 };
}

export function NavBar({ active = 'home', onItemPress, chatUnread = 0 }: NavBarProps) {
  const { barWidth, height, bottom } = useNavBarMetrics();
  const iconSize = Math.round(height * 0.52);
  const itemSize = Math.round(height * 0.8);
  const gap = Math.max(4, Math.round(itemSize * 0.25) + 5);
  // Glass pill under the active icon: as tall as the bar, a touch wider than
  // tall so it reads as a capsule, and close to the item spacing so it cannot
  // run into its neighbours.
  const pillH = height;
  const pillW = Math.round(height * 1.5);

  const activeIndex = NAV_ITEMS.findIndex((item) => item.key === active);
  const prevIndex = useRef(activeIndex);
  const [itemCenters, setItemCenters] = useState<(number | null)[]>(() =>
    new Array(NAV_ITEMS.length).fill(null),
  );
  const bubbleX = useSharedValue(0);
  const dragStart = useRef<{ x: number; pillLeft: number } | null>(null);
  const didDrag = useRef(false);

  // Measure each tab's center horizontally; the pill slides between these.
  const onItemLayout = (index: number, e: LayoutChangeEvent) => {
    const center = e.nativeEvent.layout.x + e.nativeEvent.layout.width / 2;
    setItemCenters((prev) => {
      if (prev[index] === center) return prev;
      const next = [...prev];
      next[index] = center;
      return next;
    });
  };

  const activeCenter = itemCenters[activeIndex];

  // Snap on first measurement, spring between tabs afterwards.
  useEffect(() => {
    if (activeCenter == null) return;
    const target = activeCenter - pillW / 2;
    if (prevIndex.current === activeIndex) {
      bubbleX.value = target;
    } else {
      bubbleX.value = withSpring(target, { damping: 20, stiffness: 220 });
    }
    prevIndex.current = activeIndex;
  }, [activeCenter, activeIndex]);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bubbleX.value }],
  }));

  // Drag: the pill follows the finger, then snaps to the nearest tab on
  // release and selects it. Taps still go through the Pressables below.
  const onTouchStart = (e: GestureResponderEvent) => {
    dragStart.current = { x: e.nativeEvent.pageX, pillLeft: bubbleX.value };
    didDrag.current = false;
  };

  const onTouchMove = (e: GestureResponderEvent) => {
    const start = dragStart.current;
    if (!start) return;
    const dx = e.nativeEvent.pageX - start.x;
    if (Math.abs(dx) >= 24) didDrag.current = true;
    const left = Math.min(barWidth - pillW, Math.max(0, start.pillLeft + dx));
    bubbleX.value = withSpring(left, { damping: 30, stiffness: 300 });
  };

  const endDrag = (e: GestureResponderEvent) => {
    const start = dragStart.current;
    dragStart.current = null;
    if (!start) return;
    const center = itemCenters;
    let nearest = 0;
    let best = Infinity;
    const pillCenter = bubbleX.value + pillW / 2;
    for (let i = 0; i < center.length; i++) {
      const c = center[i];
      if (c == null) continue;
      const d = Math.abs(pillCenter - c);
      if (d < best) {
        best = d;
        nearest = i;
      }
    }
    if (center[nearest] != null) {
      bubbleX.value = withSpring(center[nearest]! - pillW / 2, { damping: 20, stiffness: 220 });
    }
    if (didDrag.current && nearest !== activeIndex) {
      onItemPress?.(NAV_ITEMS[nearest].key);
    }
  };

  return (
    <View className="pointer-events-box-none absolute inset-x-0 items-center" style={{ bottom }}>
      <View
        className="overflow-hidden rounded-full border border-white/20 bg-[#F4C400]/10 shadow-lg shadow-black/40"
        style={{ width: barWidth, height }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={endDrag}
        onTouchCancel={endDrag}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
        <View
          className="flex-1 flex-row items-center justify-center"
          style={{ gap, paddingHorizontal: gap }}>
          {activeCenter != null && (
            <Animated.View
              style={[
                bubbleStyle,
                {
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  marginTop: -pillH / 2,
                  width: pillW,
                  height: pillH,
                },
              ]}
              className="overflow-hidden items-center justify-center rounded-full"
              pointerEvents="none">
              <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(244,196,0,0.14)' }]} />
            </Animated.View>
          )}
          {NAV_ITEMS.map((item, i) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: item.key === active }}
              onPress={() => {
                if (didDrag.current) return;
                onItemPress?.(item.key);
              }}
              onLayout={(e) => onItemLayout(i, e)}
              className="items-center justify-center rounded-full active:scale-90"
              style={{ width: itemSize, height: itemSize }}>
              <Ionicons
                name={item.key === active ? item.icon : item.outline}
                size={iconSize}
                color={item.key === active ? wuzyColors.yellow : '#ffffff'}
              />
              {item.key === 'chat' && chatUnread > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    minWidth: Math.round(itemSize * 0.34),
                    height: Math.round(itemSize * 0.34),
                    borderRadius: Math.round(itemSize * 0.17),
                    paddingHorizontal: 4,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: wuzyColors.yellow,
                  }}>
                  <Text
                    style={{
                      fontFamily: wuzyFonts.bold,
                      fontSize: wuzyType.caption,
                      color: wuzyColors.bg,
                    }}>
                    {chatUnread > 99 ? '99+' : chatUnread}
                  </Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}