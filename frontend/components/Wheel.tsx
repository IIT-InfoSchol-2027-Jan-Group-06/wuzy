import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

// Tuning knobs.
const STEP = 0.34; // angle between neighbours, radians
const VISIBLE = 3.5; // items away from the centre where a card is fully faded
const FLING = 0.2; // seconds of release velocity carried into the settle
const MAX_FLING = 6; // items one fling can travel
const SETTLE_MS = 400;

export interface WheelProps<T> {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  itemHeight: number;
  gap?: number;
}

function WheelItem({
  index,
  count,
  offset,
  slot,
  itemHeight,
  children,
}: {
  index: number;
  count: number;
  offset: SharedValue<number>;
  slot: number;
  itemHeight: number;
  children: ReactNode;
}) {
  const style = useAnimatedStyle(() => {
    // Signed wrapped distance from the centre, in items. This one line is what makes the wheel endless.
    let r = (((index - offset.value) % count) + count) % count;
    if (r > count / 2) r -= count;

    // Project onto a cylinder: one slot of spacing at the centre, compressing and shrinking toward the poles.
    const angle = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, r * STEP));
    const radius = slot / STEP;
    return {
      opacity: interpolate(Math.abs(r), [0, 1, VISIBLE], [1, 0.6, 0], 'clamp'),
      transform: [{ translateY: radius * Math.sin(angle) }, { scale: Math.cos(angle) }],
    };
  });

  return (
    <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: -itemHeight / 2, height: itemHeight }, style]}>
      {children}
    </Animated.View>
  );
}

/** Endless vertical wheel: the item at `offset` sits in the centre at full size, the rest wrap around above and below. */
export function Wheel<T>({ data, keyExtractor, renderItem, itemHeight, gap = 8 }: WheelProps<T>) {
  const slot = itemHeight + gap;
  // Float index of the centred item. Integer when settled.
  const offset = useSharedValue(0);
  const start = useSharedValue(0);

  useEffect(() => {
    offset.value = 0;
  }, [data, offset]);

  const pan = Gesture.Pan()
    .activeOffsetY([-8, 8])
    .onBegin(() => {
      cancelAnimation(offset);
      start.value = offset.value;
    })
    .onUpdate((e) => {
      offset.value = start.value - e.translationY / slot;
    })
    .onEnd((e) => {
      const fling = Math.max(-MAX_FLING, Math.min(MAX_FLING, (-e.velocityY * FLING) / slot));
      offset.value = withTiming(Math.round(offset.value + fling), { duration: SETTLE_MS, easing: Easing.out(Easing.cubic) });
    });

  // ponytail: every item stays mounted. Window them if a wheel ever holds hundreds.
  return (
    <GestureDetector gesture={pan}>
      <View style={{ flex: 1, justifyContent: 'center', overflow: 'hidden' }}>
        <View style={{ height: 0 }}>
          {data.map((item, index) => (
            <WheelItem key={keyExtractor(item)} index={index} count={data.length} offset={offset} slot={slot} itemHeight={itemHeight}>
              {renderItem(item)}
            </WheelItem>
          ))}
        </View>
      </View>
    </GestureDetector>
  );
}
