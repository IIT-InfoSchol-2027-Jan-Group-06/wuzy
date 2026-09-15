import Constants from 'expo-constants';
import { Alert, Linking, Platform } from 'react-native';

import { apiPostNoContent } from '@/lib/api';

/** expo-notifications has no web implementation, so load it only on native. */
export function loadNotifications() {
  if (Platform.OS === 'web') return null;
  return import('expo-notifications');
}

type NotificationsModule = NonNullable<Awaited<ReturnType<typeof loadNotifications>>>;

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
  // Setting up channels and categories needs no permission, so it is done
  // eagerly to guarantee a scheduled notification always has somewhere to land.
  await prepareChannels(mod);
  await prepareReferralCategory(mod);
}

/** Android needs one channel per notification kind or the OS silently drops it. */
async function prepareChannels(mod: NotificationsModule): Promise<void> {
  if (Platform.OS !== 'android') return;
  await mod.setNotificationChannelAsync('messages', {
    name: 'Messages',
    importance: mod.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
  });
  await mod.setNotificationChannelAsync('referrals', {
    name: 'Referrals',
    importance: mod.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
  });
}

/** Give the referral banner Accept/Decline actions where the OS renders them. */
async function prepareReferralCategory(mod: NotificationsModule): Promise<void> {
  try {
    await mod.setNotificationCategoryAsync('referrals', [
      {
        identifier: 'referral_accept',
        buttonTitle: 'Accept',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'referral_decline',
        buttonTitle: 'Decline',
        options: { opensAppToForeground: true },
      },
    ]);
  } catch (error) {
    console.error('[push] failed to set referral category', error);
  }
}

export type PushPermission = 'granted' | 'denied' | 'undetermined' | 'unavailable';

/** Ask the user for notification permission (creating Android channels first)
 * and report the resulting status. Only ever prompts when the status is
 * undetermined: iOS short-circuits requestPermissionsAsync after a denial,
 * so re-calling it for a denied user is a silent no-op that hides why nothing
 * ever appears. Safe to call repeatedly. */
export async function requestNotificationPermission(): Promise<PushPermission> {
  const mod = await loadNotifications();
  if (!mod) return 'unavailable';
  await prepareChannels(mod);
  const existing = await mod.getPermissionsAsync();
  let status: PushPermission = existing.status;
  if (status === 'undetermined') {
    console.log('[push] permission undetermined; requesting');
    status = (await mod.requestPermissionsAsync()).status as PushPermission;
  } else {
    console.log('[push] not prompting again; current status:', status);
  }
  console.log('[push] permission status:', status);
  return status;
}

/** iOS never re-prompts after a denial, so point the user at the Settings screen. */
function promptOpenNotificationSettings(): void {
  Alert.alert(
    'Notifications are off',
    'Enable notifications in Settings to receive referral alerts.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => {
          Linking.openSettings().catch(() => {});
        },
      },
    ],
  );
}

/** Ask permission and register this device's Expo push token for remote push.
 * Only the token needs an EAS project id; permission and channels are requested
 * regardless, so local notifications work even in Expo Go builds. */
export async function registerForPushNotifications(): Promise<void> {
  const mod = await loadNotifications();
  if (!mod) return;
  const permission = await requestNotificationPermission();
  if (permission === 'denied') {
    promptOpenNotificationSettings();
    return;
  }
  if (permission !== 'granted') return;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    console.log('[push] no EAS projectId; remote push unavailable in this build');
    return;
  }
  try {
    const { data: token } = await mod.getExpoPushTokenAsync({ projectId });
    await apiPostNoContent('/auth/push-token', { token });
    console.log('[push] registered Expo push token');
  } catch (error) {
    console.error('[push] push token registration failed', error);
  }
}
