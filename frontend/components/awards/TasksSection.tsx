import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';

import { TaskCard } from '@/components/awards/TaskCard';
import { taskBadgeArtFor } from '@/constants/awards-data';
import { wuzyFonts } from '@/constants/wuzy-theme';
import { apiClaimTask, apiGetAwards, assetUrl, type ApiTask } from '@/lib/api';

function toStatusText(task: ApiTask): string {
  return `${task.current_progress} / ${task.target_progress} ${task.progress_unit}`;
}

function toActionLabel(action: string): string {
  switch (action) {
    case 'CLAIM':
      return 'Claim';
    case 'ADD':
      return 'Add';
    case 'SHARE':
      return 'Share';
    default:
      return 'Go';
  }
}

/** Tasks header with a "Ready" gold pill, subtitle, then the list of task cards. */
export function TasksSection() {
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();
  const titleSize = Math.round(screenWidth * (16 / 375));
  const subtitleSize = Math.round(screenWidth * (13 / 375));
  const pillSize = Math.round(screenWidth * (11 / 375));

  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [readyCount, setReadyCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      apiGetAwards()
        .then((data) => {
          if (!active) return;
          setTasks(data.tasks);
          setReadyCount(data.ready_count);
        })
        .catch(() => {
          if (!active) return;
          setTasks([]);
          setReadyCount(0);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  const handleAction = useCallback(
    async (task: ApiTask) => {
      if (task.status === 'CLAIMABLE') {
        try {
          await apiClaimTask(task.id);
          const data = await apiGetAwards();
          setTasks(data.tasks);
          setReadyCount(data.ready_count);
        } catch {
          // Keep current state; the claim simply did not go through.
        }
        return;
      }
      switch (task.action_type) {
        case 'ADD':
          router.push('/connect');
          break;
        case 'SHARE':
          router.push({ pathname: '/ticket-vault', params: { taskId: String(task.id) } });
          break;
      }
    },
    [router],
  );

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
            {readyCount} Ready
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
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            badge={taskBadgeArtFor(task.title) ?? { uri: assetUrl(task.badge_image_url) }}
            statusText={toStatusText(task)}
            actionLabel={toActionLabel(task.action_type)}
            onAction={() => handleAction(task)}
          />
        ))}
      </View>
    </View>
  );
}