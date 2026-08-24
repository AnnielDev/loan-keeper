import type { ScheduleEvent } from "@/types/schedule";
import { formatCurrency, formatShortDate, getStartOfToday, parseCalendarDateForDisplay, toLocalDateString } from "@/utils/format";

export type PlannedNotification = {
  id: string;
  title: string;
  body: string;
  date: Date;
};

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

type NotificationCategory = "monthly" | "weekly" | "dueToday" | "dueDate";

const REMINDER_HOUR = 9;

function atReminderTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), REMINDER_HOUR, 0, 0, 0);
}

function isInMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}

/** Nearest Monday on/after `today`, delivered at REMINDER_HOUR; rolls to the
 * following Monday once that anchor has already passed (e.g. it's Monday
 * afternoon), so the weekly id/trigger stays stable — and thus non-spammy —
 * for the rest of the week. */
function nextMondayAnchor(today: Date, now: Date): Date {
  const day = today.getDay();
  const daysUntilMonday = (8 - day) % 7;
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysUntilMonday);
  if (daysUntilMonday === 0 && atReminderTime(monday).getTime() <= now.getTime()) {
    return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 7);
  }
  return monday;
}

function buildMessage(
  translate: TranslateFn,
  currency: string,
  locale: string,
  category: NotificationCategory,
  group: ScheduleEvent[],
  dateLabel?: string,
): { title: string; body: string } {
  const first = group[0];
  return {
    title: translate(`notifications.${category}.title`),
    body: translate(`notifications.${category}.body`, {
      count: group.length,
      customerName: first.customerName,
      amount: formatCurrency(first.amount, currency, locale),
      date: dateLabel,
    }),
  };
}

/**
 * Computes which local notifications should be scheduled right now, given the
 * set of pending (non-completed) schedule events for the current and next
 * month. Pure/deterministic aside from `now` and `firedTodayIds`, so it's
 * safe to call on every app foreground and re-derive the full plan from
 * scratch (the caller cancels all previously scheduled notifications and
 * reschedules exactly this plan).
 */
export function buildNotificationPlan(params: {
  events: ScheduleEvent[];
  now: Date;
  currency: string;
  locale: string;
  translate: TranslateFn;
  firedTodayIds: string[];
}): { plan: PlannedNotification[]; firedTodayIds: string[] } {
  const { events, now, currency, locale, translate, firedTodayIds } = params;
  const pending = events.filter((event) => event.status !== "completed");
  const today = getStartOfToday();
  const todayKey = toLocalDateString(today);
  const plan: PlannedNotification[] = [];
  const nextFiredTodayIds = [...firedTodayIds];

  // --- Monthly: current month (only if day 1 hasn't happened yet) + next month (always, proactively) ---
  const yearNow = today.getFullYear();
  const monthNow = today.getMonth();
  const nextMonthFirst = new Date(yearNow, monthNow + 1, 1);
  const nextMonthYear = nextMonthFirst.getFullYear();
  const nextMonth = nextMonthFirst.getMonth();

  const currentMonthEvents = pending.filter((event) =>
    isInMonth(parseCalendarDateForDisplay(event.dueDate), yearNow, monthNow),
  );
  const nextMonthEvents = pending.filter((event) =>
    isInMonth(parseCalendarDateForDisplay(event.dueDate), nextMonthYear, nextMonth),
  );

  const currentMonthAnchor = atReminderTime(new Date(yearNow, monthNow, 1));
  if (currentMonthEvents.length > 0 && currentMonthAnchor.getTime() > now.getTime()) {
    plan.push({
      id: `monthly-${yearNow}-${monthNow + 1}`,
      date: currentMonthAnchor,
      ...buildMessage(translate, currency, locale, "monthly", currentMonthEvents),
    });
  }
  if (nextMonthEvents.length > 0) {
    plan.push({
      id: `monthly-${nextMonthYear}-${nextMonth + 1}`,
      date: atReminderTime(nextMonthFirst),
      ...buildMessage(translate, currency, locale, "monthly", nextMonthEvents),
    });
  }

  // --- Weekly: rolling 7-day window, delivered on the nearest upcoming Monday ---
  const windowEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6);
  const weekEvents = pending.filter((event) => {
    const dueDate = parseCalendarDateForDisplay(event.dueDate);
    return dueDate.getTime() >= today.getTime() && dueDate.getTime() <= windowEnd.getTime();
  });
  if (weekEvents.length > 0) {
    const monday = nextMondayAnchor(today, now);
    plan.push({
      id: `weekly-${toLocalDateString(monday)}`,
      date: atReminderTime(monday),
      ...buildMessage(translate, currency, locale, "weekly", weekEvents),
    });
  }

  // --- Due-date: one notification per calendar day that has pending payments due ---
  const dueGroups = new Map<string, ScheduleEvent[]>();
  pending
    .filter((event) => event.status === "today" || event.status === "upcoming")
    .forEach((event) => {
      const key = toLocalDateString(parseCalendarDateForDisplay(event.dueDate));
      const group = dueGroups.get(key) ?? [];
      group.push(event);
      dueGroups.set(key, group);
    });

  for (const [dateKey, group] of dueGroups) {
    if (dateKey === todayKey) {
      const id = `due-${dateKey}`;
      const anchor = atReminderTime(today);
      if (anchor.getTime() > now.getTime()) {
        plan.push({ id, date: anchor, ...buildMessage(translate, currency, locale, "dueToday", group) });
      } else if (!firedTodayIds.includes(id)) {
        // Reminder time already passed today (app opened later) — fire almost
        // immediately instead of silently skipping, but only once per day
        // (tracked via firedTodayIds) so reopening the app doesn't re-notify.
        plan.push({
          id,
          date: new Date(now.getTime() + 5_000),
          ...buildMessage(translate, currency, locale, "dueToday", group),
        });
        nextFiredTodayIds.push(id);
      }
      continue;
    }

    const dueDate = parseCalendarDateForDisplay(group[0].dueDate);
    if (dueDate.getTime() > today.getTime()) {
      plan.push({
        id: `due-${dateKey}`,
        date: atReminderTime(dueDate),
        ...buildMessage(translate, currency, locale, "dueDate", group, formatShortDate(group[0].dueDate, locale)),
      });
    }
  }

  return { plan, firedTodayIds: nextFiredTodayIds };
}
