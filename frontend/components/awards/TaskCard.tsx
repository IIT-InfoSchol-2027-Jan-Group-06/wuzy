import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';

import { wuzyFonts } from '@/constants/wuzy-theme';
import type { AwardTask } from '@/constants/awards-data';

type TaskCardProps = {
  task: AwardTask;
  onAction?: (task: AwardTask) => void;
};

/** One task row: badge image, title and progress grouped on the left, a fixed action button on the right. */
export function TaskCard({ task, onAction }: TaskCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const titleSize = Math.round(screenWidth * (15 / 375));
  const statusSize = Math.round(screenWidth * (11 / 375));
  const actionSize = Math.round(screenWidth * (11 / 375));

  const isReady = task.status === 'ready';
  const ratio = task.max > 0 ? Math.min(1, task.current / task.max) : 0;
  const progressPercent = `${Math.round(ratio * 100)}%` as const;

  // The 3rd task badge renders a little smaller, centered inside the same 56px
  // slot so the row layout stays identical to the other tasks.
  const badgeNarrow = task.id === 'connect-ravers';

  return (
    <View className="flex-row items-center justify-between gap-4 rounded-2xl bg-[#131927] p-4">
      <View className="flex-1 flex-row items-center gap-4">
        <View className="items-center justify-center" style={{ width: 56, height: 56 }}>
          <Image
            source={task.badge}
            resizeMode="contain"
            style={{ width: badgeNarrow ? 44 : 56, height: badgeNarrow ? 44 : 56 }}
          />
        </View>

        <View className="flex-1">
          <Text
            numberOfLines={1}
            style={{ fontFamily: wuzyFonts.medium, fontSize: titleSize, color: '#FFFFFF' }}>
            {task.title}
          </Text>
          <View className="mt-[7px] h-[5px] overflow-hidden rounded-full bg-white/10">
            <View
              className="h-full rounded-full bg-wuzy-yellow"
              style={{ width: progressPercent }}
            />
          </View>
          <Text
            style={{
              marginTop: 5,
              fontFamily: wuzyFonts.body,
              fontSize: statusSize,
              color: '#8E9BAE',
            }}>
            {task.statusText}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => onAction?.(task)}
        className={`min-w-[70px] items-center self-center rounded-full px-[18px] py-[10px] active:scale-95 ${
          isReady ? 'bg-wuzy-yellow' : 'border border-wuzy-yellow/40'
        }`}>
        <Text
          style={{
            fontFamily: wuzyFonts.semibold,
            fontSize: actionSize,
            color: isReady ? '#0B0E14' : '#FFE783',
          }}>
          {task.actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}