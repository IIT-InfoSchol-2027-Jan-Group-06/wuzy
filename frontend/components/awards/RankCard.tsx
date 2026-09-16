import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { RANK_SLOT, deckImage } from '@/constants/awards-data';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import type { ApiQuestXp } from '@/lib/api';

const BADGE = 225;

interface RankCardProps {
  xp: ApiQuestXp;
  deck: number[];
  /** The rank before the last dashboard change, or null on first load. */
  previousRankIndex: number | null;
}

/** A tall centred block straight on the page: the rank's badge above its name,
 * the XP count and the bar to the next rank. The bar snaps on mount and eases on
 * change; a rank-up crossfades the badge exactly once. */
export function RankCard({ xp, deck, previousRankIndex }: RankCardProps) {
  const span = xp.next_threshold == null ? 0 : xp.next_threshold - xp.rank_threshold;
  const fraction = span === 0 ? 1 : Math.min(1, Math.max(0, (xp.total_xp - xp.rank_threshold) / span));
  const maxRank = xp.next_rank == null;

  const fill = useSharedValue(fraction);
  const leave = useSharedValue(0);
  const enter = useSharedValue(1);
  const enterY = useSharedValue(0);
  const glow = useSharedValue(0.7);
  // The badge fading out during a rank-up; it stays mounted at opacity 0 afterwards.
  const leavingIndex = previousRankIndex != null && previousRankIndex !== xp.rank_index ? previousRankIndex : null;

  useEffect(() => {
    fill.value = withTiming(fraction, { duration: 500 });
  }, [fraction, fill]);

  useEffect(() => {
    if (previousRankIndex == null || previousRankIndex === xp.rank_index) return;
    leave.value = 1;
    enter.value = 0;
    enterY.value = 40;
    leave.value = withTiming(0, { duration: 260 });
    enter.value = withTiming(1, { duration: 380 });
    enterY.value = withSpring(0, { damping: 14, stiffness: 120 });
  }, [xp.rank_index, previousRankIndex, leave, enter, enterY]);

  useEffect(() => {
    if (!maxRank) return;
    glow.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
    return () => cancelAnimation(glow);
  }, [maxRank, glow]);

  useEffect(
    () => () => {
      cancelAnimation(fill);
      cancelAnimation(leave);
      cancelAnimation(enter);
      cancelAnimation(enterY);
    },
    [fill, leave, enter, enterY],
  );

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));
  const leaveStyle = useAnimatedStyle(() => ({ opacity: leave.value }));
  const enterStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: enterY.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <View className="items-center" style={{ gap: wuzyLayout.itemGap }}>
      <View style={{ width: BADGE, height: BADGE, alignItems: 'center', justifyContent: 'center' }}>
        {maxRank && (
          <Animated.View style={[StyleSheet.absoluteFill, styles.center, glowStyle]}>
            {[300, 250, 200].map((size, i) => (
              <View
                key={size}
                style={{
                  position: 'absolute',
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: wuzyColors.yellowDim,
                  opacity: 0.35 + i * 0.2,
                }}
              />
            ))}
          </Animated.View>
        )}
        {leavingIndex != null && (
          <Animated.Image
            source={deckImage(deck, RANK_SLOT + leavingIndex)}
            resizeMode="contain"
            style={[{ position: 'absolute', width: BADGE, height: BADGE }, leaveStyle]}
          />
        )}
        <Animated.Image
          source={deckImage(deck, RANK_SLOT + xp.rank_index)}
          resizeMode="contain"
          style={[{ width: BADGE, height: BADGE }, enterStyle]}
        />
      </View>

      <View style={{ alignSelf: 'stretch', alignItems: 'center', gap: 4 }}>
        <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.section, color: wuzyColors.yellow }}>
          {xp.rank}
        </Text>
        <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.body, color: wuzyColors.white }}>
          {xp.total_xp} XP
        </Text>
        <View className="overflow-hidden rounded-full bg-white/10" style={{ height: 8, alignSelf: 'stretch', marginTop: 4 }}>
          <Animated.View style={[{ height: '100%', borderRadius: 4, backgroundColor: wuzyColors.yellow }, fillStyle]} />
        </View>
        <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.gray }}>
          {xp.next_rank && xp.next_threshold != null
            ? `${xp.next_threshold - xp.total_xp} XP to ${xp.next_rank}`
            : 'Max rank'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
