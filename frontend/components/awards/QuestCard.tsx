import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import type { ApiQuest } from '@/lib/api';

const BURST_MS = 920;
const PIECE_MS = 800;

// Eight sparkle pieces in theme colours: angle, distance, size and start delay.
const SPARKLES = [
  { angle: 50, distance: 48, size: 14, color: wuzyColors.yellow, delay: 0 },
  { angle: 72, distance: 58, size: 6, color: wuzyColors.white, delay: 60 },
  { angle: 95, distance: 64, size: 5, color: wuzyColors.yellowSoft, delay: 90 },
  { angle: 112, distance: 54, size: 6, color: wuzyColors.yellowMuted, delay: 40 },
  { angle: 128, distance: 42, size: 14, color: wuzyColors.yellow, delay: 120 },
  { angle: 62, distance: 34, size: 5, color: wuzyColors.yellowSoft, delay: 80 },
  { angle: 80, distance: 28, size: 5, color: wuzyColors.white, delay: 110 },
  { angle: 140, distance: 30, size: 6, color: wuzyColors.yellowMuted, delay: 50 },
];

interface QuestCardProps {
  quest: ApiQuest;
  /** The right-hand pill while the tier is in progress. No onPress renders it disabled. */
  action?: { label: string; onPress?: () => void };
  claiming: boolean;
  onClaim: () => Promise<void>;
}

/** One quest line: name, tier line, progress pill with the counter inside, tier
 * dots, and on the right Claim (solid), the action (outlined) or Done (muted). */
export function QuestCard({ quest, action, claiming, onClaim }: QuestCardProps) {
  const tiers = quest.tiers;
  const index = quest.active_tier_index ?? tiers.length - 1;
  const tier = tiers[index];
  const done = quest.completed;
  const fraction = done ? 1 : Math.min(1, tier.current_progress / tier.target_count);

  const [celebrate, setCelebrate] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const pop = useSharedValue(1);
  const burst = useSharedValue(0);

  useEffect(() => {
    if (!note) return;
    const timer = setTimeout(() => setNote(null), 2000);
    return () => clearTimeout(timer);
  }, [note]);

  useEffect(
    () => () => {
      cancelAnimation(pop);
      cancelAnimation(burst);
    },
    [pop, burst],
  );

  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  const handleClaim = async () => {
    if (!quest.claimable || claiming) return;
    try {
      await onClaim();
    } catch (error) {
      setNote(error instanceof Error ? error.message : 'Could not claim');
      return;
    }
    setCelebrate(true);
    pop.value = withSequence(withSpring(1.12, { damping: 12, stiffness: 280 }), withSpring(1, { damping: 16, stiffness: 240 })); // eslint-disable-line react-hooks/immutability
    burst.value = withSequence( // eslint-disable-line react-hooks/immutability
      withTiming(0, { duration: 0 }),
      withTiming(1, { duration: BURST_MS }, (finished) => {
        if (finished) runOnJS(setCelebrate)(false);
      }),
    );
  };

  let control;
  if (claiming) {
    control = <Pill variant="solid" loading />;
  } else if (quest.claimable) {
    control = <Pill variant="solid" label="Claim" onPress={handleClaim} />;
  } else if (done) {
    control = <Pill variant="muted" label="Done" />;
  } else if (action) {
    control = <Pill variant="outline" label={action.label} onPress={action.onPress} />;
  }

  return (
    <View className="rounded-3xl bg-wuzy-surface p-4" style={done ? { opacity: 0.5 } : undefined}>
      <View className="flex-row items-center" style={{ gap: wuzyLayout.itemGap }}>
        <View className="flex-1" style={{ gap: 4 }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: wuzyFonts.semibold,
              fontSize: wuzyType.body,
              color: done ? wuzyColors.gray : wuzyColors.white,
              textDecorationLine: done ? 'line-through' : 'none',
            }}>
            {quest.name}
          </Text>
          <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.caption, color: wuzyColors.yellow }}>
            Tier {index + 1} of {tiers.length} · {tier.name}
          </Text>

          <View className="justify-center overflow-hidden rounded-full bg-white/10" style={{ height: 24, marginTop: 4 }}>
            <View className="absolute left-0 top-0 h-full rounded-full bg-wuzy-yellow" style={{ width: `${Math.round(fraction * 100)}%` }} />
            <Text
              numberOfLines={1}
              className="text-center"
              style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.caption, color: done ? wuzyColors.gray : wuzyColors.white }}>
              {done ? tier.target_count : tier.current_progress} / {tier.target_count} {tier.progress_unit}
            </Text>
          </View>

          <View className="flex-row items-center" style={{ gap: 5, marginTop: 2 }}>
            {tiers.map((t, i) => {
              const active = !done && i === index;
              return (
                <View
                  key={t.id}
                  style={{
                    width: active ? 14 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: t.claimed || active ? wuzyColors.yellow : 'rgba(255,255,255,0.15)',
                  }}
                />
              );
            })}
          </View>

          {note ? (
            <Text numberOfLines={2} style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.caption, color: wuzyColors.yellow }}>
              {note}
            </Text>
          ) : null}
        </View>

        <Animated.View style={popStyle}>
          {control}
          {celebrate && (
            <View style={{ position: 'absolute', width: 0, height: 0, top: '50%', left: '50%' }}>
              {SPARKLES.map((s, i) => (
                <SparklePiece key={i} burst={burst} {...s} />
              ))}
            </View>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

function Pill({
  variant,
  label,
  onPress,
  loading,
}: {
  variant: 'solid' | 'outline' | 'muted';
  label?: string;
  onPress?: () => void;
  loading?: boolean;
}) {
  const disabled = loading || !onPress;
  const className =
    variant === 'solid'
      ? 'bg-wuzy-yellow'
      : variant === 'outline'
        ? 'border border-wuzy-yellow/50'
        : 'border border-white/20';
  const color = variant === 'solid' ? wuzyColors.bg : variant === 'outline' ? wuzyColors.yellow : wuzyColors.gray;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`items-center justify-center rounded-full px-[16px] py-[8px] active:opacity-80 ${className}`}
      style={{ minWidth: 76, opacity: variant === 'outline' && !onPress ? 0.5 : 1 }}>
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color }}>{label}</Text>
      )}
    </Pressable>
  );
}

/** One sparkle: reads the shared burst clock, waits its delay, flies out, spins and fades. */
function SparklePiece({
  burst,
  angle,
  distance,
  size,
  color,
  delay,
}: {
  burst: { value: number };
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
}) {
  const style = useAnimatedStyle(() => {
    const t = Math.min(1, Math.max(0, (burst.value * BURST_MS - delay) / PIECE_MS));
    const p = Easing.out(Easing.cubic)(t);
    const rad = (angle * Math.PI) / 180;
    return {
      opacity: 1 - p,
      transform: [
        { translateX: Math.cos(rad) * distance * p },
        { translateY: -Math.sin(rad) * distance * p },
        { rotate: `${p * 240}deg` },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        style,
        { position: 'absolute', width: size, height: size, borderRadius: size > 10 ? size / 2 : 2, backgroundColor: color },
      ]}
    />
  );
}
