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
    let r = (((index - offset.value) % count) + count) % count;
    if (r > count / 2) r -= count;

    const angle = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, r * STEP));
    const radius = slot / STEP;
    return {
      opacity: interpolate(Math.abs(r), [0, 1, VISIBLE], [1, 0.85, 0], 'clamp'),
      transform: [{ translateY: radius * Math.sin(angle) }, { scale: Math.cos(angle) }],
    };
  });

  return (
    <Animated.View
      style={[
        { position: 'absolute', left: 0, right: 0, top: -itemHeight / 2, height: itemHeight },
        style,
      ]}>
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
    offset.value = withTiming(0, { duration: 250 });
  }, [data, offset]);

  const pan = Gesture.Pan()
    .activeOffsetY([-8, 8])
    .onBegin(() => {
      cancelAnimation(offset);
      start.value = offset.value;
    })
    .onUpdate((e) => {
      // The compiler linter treats Reanimated shared values as immutable; they are mutable by design.
      // eslint-disable-next-line react-hooks/immutability
      offset.value = start.value - e.translationY / slot;
    })
    .onEnd((e) => {
      const fling = Math.max(-MAX_FLING, Math.min(MAX_FLING, (-e.velocityY * FLING) / slot));
      // eslint-disable-next-line react-hooks/immutability
      offset.value = withTiming(Math.round(offset.value + fling), { duration: SETTLE_MS, easing: Easing.out(Easing.cubic) });
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={{ flex: 1, justifyContent: 'center', overflow: 'hidden' }}>
        {/* collapsable off so Android cannot flatten this height-0 layer and reshuffle who the wrappers are siblings of. */}
        <View collapsable={false} style={{ height: 0 }}>
          {data.map((item, i) => (
            <WheelItem
              key={keyExtractor(item)}
              index={i}
              count={data.length}
              offset={offset}
              slot={slot}
              itemHeight={itemHeight}>
              {renderItem(item)}
            </WheelItem>
          ))}
        </View>
      </View>
    </GestureDetector>
  );
}
