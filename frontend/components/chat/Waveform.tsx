import { View } from 'react-native';

/** "m:ss" time label, shared by the recording bar and the chat bubbles. */
export function formatVoiceTime(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** A row of vertical bars filled (played) up to `progress` (0..1). */
export function Waveform({
  levels,
  progress,
  color,
  mutedColor,
  height = 14,
}: {
  levels: number[];
  progress: number;
  color: string;
  mutedColor: string;
  height?: number;
}) {
  return (
    <View className="flex-row items-center">
      {levels.map((level, i) => {
        const played = i / Math.max(1, levels.length - 1) <= progress;
        return (
          <View
            key={i}
            style={{
              width: 2.5,
              marginRight: 2,
              height: Math.max(3, Math.round(level * height)),
              borderRadius: 2,
              backgroundColor: played ? color : mutedColor,
            }}
          />
        );
      })}
    </View>
  );
}

/** Fixed pseudo-waveform for a finished recording, stable per note. */
export function staticLevels(length = 22, seed: number): number[] {
  return Array.from({ length }, (_, i) => {
    const wave = Math.abs(Math.sin(i * 0.9 + seed));
    return 0.35 + 0.65 * wave;
  });
}

/** Live bars while recording: amplitude from the meter, phase from elapsed time. */
export function recordingLevels(elapsedMs: number, metering?: number): number[] {
  const base = metering == null ? 0.5 : Math.min(1, Math.max(0.12, (metering + 60) / 60));
  const t = elapsedMs / 1000;
  return Array.from({ length: 22 }, (_, i) => {
    const wave = Math.abs(Math.sin(i * 0.7 + t * 2));
    return Math.min(1, Math.max(0.15, base * (0.55 + 0.65 * wave)));
  });
}