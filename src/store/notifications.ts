import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";

import i18n from "@/i18n";
import {
  cancelAllScheduledNotifications,
  configureNotificationHandler,
  ensureAndroidNotificationChannel,
  ensureNotificationPermission,
  scheduleLocalNotification,
} from "@/services/notifications";
import { getScheduleEvents } from "@/services/schedule";
import { useAuthStore } from "@/store/auth";
import type { ScheduleEvent } from "@/types/schedule";
import { buildNotificationPlan } from "@/utils/notificationPlan";
import { toLocalDateString } from "@/utils/format";

const FIRED_TODAY_STORAGE_KEY = "loan-keeper.notifications.firedToday";

configureNotificationHandler();

async function fetchPendingEvents(now: Date): Promise<ScheduleEvent[]> {
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const nextMonthDate = new Date(year, now.getMonth() + 1, 1);

  const [current, next] = await Promise.all([
    getScheduleEvents({ month, year, includePaid: false }),
    getScheduleEvents({ month: nextMonthDate.getMonth() + 1, year: nextMonthDate.getFullYear(), includePaid: false }),
  ]);

  return [...current, ...next].filter((event) => event.status !== "completed");
}

async function loadFiredTodayIds(now: Date): Promise<string[]> {
  const raw = await AsyncStorage.getItem(FIRED_TODAY_STORAGE_KEY);
  if (!raw) return [];
  try {
    const stored = JSON.parse(raw) as { date: string; ids: string[] };
    return stored.date === toLocalDateString(now) ? stored.ids : [];
  } catch {
    return [];
  }
}

async function saveFiredTodayIds(now: Date, ids: string[]): Promise<void> {
  await AsyncStorage.setItem(FIRED_TODAY_STORAGE_KEY, JSON.stringify({ date: toLocalDateString(now), ids }));
}

let isRunning = false;

async function runSchedulingPass(): Promise<void> {
  if (isRunning) return;
  const { accessToken, user } = useAuthStore.getState();
  if (!accessToken || !user) return;

  isRunning = true;
  try {
    await ensureAndroidNotificationChannel();
    const granted = await ensureNotificationPermission();
    if (!granted) return;

    const now = new Date();
    const [events, firedTodayIds] = await Promise.all([fetchPendingEvents(now), loadFiredTodayIds(now)]);

    const { plan, firedTodayIds: nextFiredTodayIds } = buildNotificationPlan({
      events,
      now,
      currency: user.currency,
      locale: i18n.language,
      translate: (key, options) => (i18n.t as (key: string, options?: Record<string, unknown>) => string)(key, options),
      firedTodayIds,
    });

    await cancelAllScheduledNotifications();
    await Promise.all(plan.map((item) => scheduleLocalNotification(item)));
    await saveFiredTodayIds(now, nextFiredTodayIds);
  } catch {
    // Best effort: offline or API failures resolve themselves on the next foreground pass.
  } finally {
    isRunning = false;
  }
}

if (AppState.currentState === "active") {
  runSchedulingPass();
}

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    runSchedulingPass();
  }
});

useAuthStore.subscribe((state, prevState) => {
  if (prevState.accessToken && !state.accessToken) {
    cancelAllScheduledNotifications().catch(() => {});
  }
});
