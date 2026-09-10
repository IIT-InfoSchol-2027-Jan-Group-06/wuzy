import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { apiPostNoContent } from '@/lib/api';

/** expo-notifications has no web implementation, so load it only on native. */
export function loadNotifications() {
  if (Platform.OS === 'web') return null;
  return import('expo-notifications');
}

let handlerSet = false;

/** Show chat pushes as a banner even while the app is in the foreground. */
export async function configureNotifications(): Promise<void> {
  const mod = await loadNotifications();
  if (!mod || handlerSet) return;
  handlerSet = true;
  mod.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Ask the user for permission, fetch an Expo push token, and register it. */
export async function registerForPushNotifications(): Promise<void> {
  const mod = await loadNotifications();
  if (!mod) return;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return;

  if (Platform.OS === 'android') {
    await mod.setNotificationChannelAsync('messages', {
      name: 'Messages',
      importance: mod.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const existing = await mod.getPermissionsAsync();
  let finalStatus = existing.status;
  if (existing.status !== 'granted') {
    finalStatus = (await mod.requestPermissionsAsync()).status;
  }
  if (finalStatus !== 'granted') return;

  const { data: token } = await mod.getExpoPushTokenAsync({ projectId });
  await apiPostNoContent('/auth/push-token', { token });
}