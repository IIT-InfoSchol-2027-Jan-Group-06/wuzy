import { Image, Pressable, Text, View, useWindowDimensions, type ImageSourcePropType } from 'react-native';

import { wuzyFonts } from '@/constants/wuzy-theme';
import type { ApiTask } from '@/lib/api';

type TaskCardProps = {
  task: ApiTask;
  badge: ImageSourcePropType;
  statusText: string;
  actionLabel: string;
  onAction: () => void;
};

/** One task row: badge image, title and progress grouped on the left, a fixed action button on the right. */
export function TaskCard({ task, badge, statusText, actionLabel, onAction }: TaskCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const titleSize = Math.round(screenWidth * (15 / 375));
  const statusSize = Math.round(screenWidth * (11 / 375));
  const actionSize = Math.round(screenWidth * (11 / 375));

  const isClaimable = task.status === 'CLAIMABLE';
  const isClaimed = task.status === 'CLAIMED';
  const ratio = task.target_progress > 0 ? Math.min(1, task.current_progress / task.target_progress) : 0;
  const progressPercent = `${Math.round(ratio * 100)}%` as const;

  // The 3rd task badge renders a little smaller, centered inside the same 56px
  // slot so the row layout stays identical to the other tasks.
  const badgeNarrow = task.title === 'Connect with 10 Ravers';

  return (
    <View className="flex-row items-center justify-between gap-4 rounded-2xl bg-[#131927] p-4">
      <View className="flex-1 flex-row items-center gap-4">
        <View className="items-center justify-center" style={{ width: 56, height: 56 }}>
          <Image
            source={badge}
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
            {statusText}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onAction}
        disabled={isClaimed}
        className={`min-w-[70px] items-center self-center rounded-full px-[18px] py-[10px] active:scale-95 ${
          isClaimable ? 'bg-wuzy-yellow' : isClaimed ? 'border border-white/20' : 'border border-wuzy-yellow/40'
        }`}>
        <Text
          style={{
            fontFamily: wuzyFonts.semibold,
            fontSize: actionSize,
            color: isClaimable ? '#0B0E14' : isClaimed ? '#8E9BAE' : '#FFE783',
          }}>
          {isClaimed ? 'Claimed' : isClaimable ? 'Claim' : actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}