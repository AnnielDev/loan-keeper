import { isRunningInExpoGo } from "expo";
import type * as ExpoNotifications from "expo-notifications";
import { Platform } from "react-native";

const ANDROID_CHANNEL_ID = "payment-reminders";

/** Merely `require`-ing `expo-notifications` throws synchronously on Android
 * when running inside Expo Go — its push-token auto-registration side effect
 * (module-load-time code, unrelated to any function we call) was removed
 * from Expo Go on Android in SDK 53. Local notifications work everywhere
 * else (iOS Expo Go, or a dev/standalone build on either platform), so the
 * module must simply never be required in that one unsupported combination. */
const isUnsupportedInExpoGo = Platform.OS === "android" && isRunningInExpoGo();

let cachedModule: typeof ExpoNotifications | null = null;

function loadNotifications(): typeof ExpoNotifications | null {
  if (isUnsupportedInExpoGo) return null;
  if (!cachedModule) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- deferring require() (vs. a static import) keeps the module from ever loading in the unsupported Android+Expo Go combination.
    cachedModule = require("expo-notifications") as typeof ExpoNotifications;
  }
  return cachedModule;
}

export function configureNotificationHandler(): void {
  const Notifications = loadNotifications();
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  const Notifications = loadNotifications();
  if (!Notifications) return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "Payment reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const Notifications = loadNotifications();
  if (!Notifications) return false;

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;

  const requested = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return requested.granted;
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  const Notifications = loadNotifications();
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleLocalNotification(params: {
  id: string;
  title: string;
  body: string;
  date: Date;
}): Promise<string | null> {
  const Notifications = loadNotifications();
  if (!Notifications) return null;

  return Notifications.scheduleNotificationAsync({
    identifier: params.id,
    content: {
      title: params.title,
      body: params.body,
      sound: Platform.OS === "ios" ? "default" : undefined,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: params.date,
      channelId: Platform.OS === "android" ? ANDROID_CHANNEL_ID : undefined,
    },
  });
}

export async function getAllScheduledNotifications(): Promise<ExpoNotifications.NotificationRequest[]> {
  const Notifications = loadNotifications();
  if (!Notifications) return [];
  return Notifications.getAllScheduledNotificationsAsync();
}
