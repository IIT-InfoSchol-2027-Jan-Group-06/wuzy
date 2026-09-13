import Constants from 'expo-constants';
import { File, Paths } from 'expo-file-system';
import { Alert, Linking, Platform } from 'react-native';

import { apiPostNoContent, assetUrl } from '@/lib/api';

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

/** iOS-only: download the sender's avatar into the cache so the banner can attach
 * it next to the title. Android has no notification-image API in
 * expo-notifications, so it never sends an attachment there. */
async function prepareAvatarAttachment(
  avatarUrl: string | null,
  referralId: number,
): Promise<{ identifier: string; url: string; type: string; typeHint: string }[] | undefined> {
  if (Platform.OS !== 'ios' || !avatarUrl) return undefined;
  try {
    const file = new File(Paths.cache, `referral-avatar-${referralId}.jpg`);
    await File.downloadFileAsync(assetUrl(avatarUrl), file, { idempotent: true });
    return [{ identifier: 'referral-avatar', url: file.uri, type: 'image', typeHint: 'image' }];
  } catch (error) {
    console.warn('[push] avatar download failed; banner without the picture', error);
    return undefined;
  }
}

/** Show the referral as a real OS banner on this device. Called on Send Request
 * so the live notification is visible even where remote push cannot reach the
 * recipient (Expo Go builds without an EAS project). */
export async function scheduleReferralNotification(
  senderName: string,
  targetName: string,
  referralId: number,
  senderAvatarUrl: string | null = null,
): Promise<void> {
  const mod = await loadNotifications();
  if (!mod) return;
  const permission = await requestNotificationPermission();
  if (permission === 'denied') {
    console.warn('[push] permission denied; showing settings prompt');
    promptOpenNotificationSettings();
    return;
  }
  if (permission !== 'granted') return;
  try {
    const id = await mod.scheduleNotificationAsync({
      content: {
        title: senderName,
        body: `wants to refer you to ${targetName}`,
        data: { url: '/notifications', referralId },
        sound: 'default',
        categoryIdentifier: 'referrals',
        ...(Platform.OS === 'ios'
          ? { attachments: await prepareAvatarAttachment(senderAvatarUrl, referralId) }
          : {}),
      },
      trigger: { channelId: 'referrals' },
    });
    console.log('[push] scheduled referral notification', id);
  } catch (error) {
    console.error('[push] scheduleReferralNotification failed', error);
  }
}