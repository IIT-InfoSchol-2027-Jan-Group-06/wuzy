import { Text, View, useWindowDimensions } from 'react-native';

import { TaskCard } from '@/components/awards/TaskCard';
import { wuzyFonts } from '@/constants/wuzy-theme';
import { awardTasks } from '@/constants/awards-data';

/** Tasks header with a "Ready" gold pill, subtitle, then the list of task cards. */
export function TasksSection() {
  const { width: screenWidth } = useWindowDimensions();
  const titleSize = Math.round(screenWidth * (16 / 375));
  const subtitleSize = Math.round(screenWidth * (13 / 375));
  const pillSize = Math.round(screenWidth * (11 / 375));
  const readyLabel = '3 Ready';

  return (
    <View className="mt-[30px]">
      <View className="flex-row items-center justify-between">
        <Text
          style={{ fontFamily: wuzyFonts.bold, fontSize: titleSize, color: '#FFE783' }}>
          Tasks
        </Text>
        <View className="rounded-full border border-wuzy-yellow/30 bg-wuzy-yellow/15 px-[12px] py-[5px]">
          <Text
            style={{ fontFamily: wuzyFonts.semibold, fontSize: pillSize, color: '#FFE783' }}>
            {readyLabel}
          </Text>
        </View>
      </View>

      <Text
        style={{
          marginTop: 4,
          fontFamily: wuzyFonts.body,
          fontSize: subtitleSize,
          color: '#8E9BAE',
        }}>
        Complete tasks to collect exclusive badges
      </Text>

      <View className="mt-[16px] gap-[12px]">
        {awardTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </View>
    </View>
  );
}