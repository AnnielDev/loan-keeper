import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScheduleAgendaCard } from "@/components/schedule/ScheduleAgendaCard";
import { ScheduleCalendar, type CalendarDotStatus } from "@/components/schedule/ScheduleCalendar";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useScheduleEvents } from "@/hooks/useScheduleEvents";
import type { ScheduleEvent } from "@/types/schedule";

const DOT_PRIORITY: Record<CalendarDotStatus, number> = {
  overdue: 0,
  upcoming: 1,
  completed: 2,
};

function todayIsoDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// event.dueDate is already a "YYYY-MM-DD" key from the API — reading it
// directly avoids routing it through `new Date()`, which parses date-only
// strings as UTC midnight and rolls the day back in timezones behind UTC.
function eventIsoDate(event: ScheduleEvent): string {
  return event.dueDate.slice(0, 10);
}

// A plain "YYYY-MM-DD" key must be parsed as a local date, not via `new
// Date(isoDate)` — date-only ISO strings parse as UTC midnight per spec,
// which rolls back a day in timezones behind UTC.
function parseIsoDateLocal(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDotStatus(status: ScheduleEvent["status"]): CalendarDotStatus {
  if (status === "overdue" || status === "today") return "overdue";
  if (status === "completed") return "completed";
  return "upcoming";
}

export default function ScheduleTabScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();

  const today = useMemo(() => new Date(), []);
  const [viewedMonth, setViewedMonth] = useState(today.getMonth() + 1);
  const [viewedYear, setViewedYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(todayIsoDate());

  const { data, isLoading, isRefreshing, error, refetch } = useScheduleEvents(viewedMonth, viewedYear);

  const dotsByDay = useMemo(() => {
    const map: Record<string, CalendarDotStatus> = {};
    for (const event of data ?? []) {
      const day = eventIsoDate(event);
      const status = toDotStatus(event.status);
      const existing = map[day];
      if (!existing || DOT_PRIORITY[status] < DOT_PRIORITY[existing]) {
        map[day] = status;
      }
    }
    return map;
  }, [data]);

  const selectedDayEvents = useMemo(
    () =>
      (data ?? [])
        .filter((event) => eventIsoDate(event) === selectedDate)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [data, selectedDate],
  );

  const handleChangeMonth = (delta: number) => {
    let month = viewedMonth + delta;
    let year = viewedYear;
    if (month < 1) {
      month = 12;
      year -= 1;
    } else if (month > 12) {
      month = 1;
      year += 1;
    }
    setViewedMonth(month);
    setViewedYear(year);

    // Carry the selected day-of-month into the new month (clamped if it's
    // shorter) — the old selectedDate belongs to a different month, so it
    // would never match any event in the newly loaded data otherwise.
    const currentDay = Number(selectedDate.slice(8, 10));
    const daysInNewMonth = new Date(year, month, 0).getDate();
    const clampedDay = Math.min(currentDay, daysInNewMonth);
    setSelectedDate(`${year}-${String(month).padStart(2, "0")}-${String(clampedDay).padStart(2, "0")}`);
  };

  const handleAction = (event: ScheduleEvent) => {
    router.push({
      pathname: "/loan-payment-form",
      params: { loanId: event.loanId, installmentId: event.installmentId },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          {t("schedule.errors.loadFailed")}
        </Text>
        <Pressable onPress={refetch} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
          <Text style={[styles.retryLabel, { color: colors.onPrimary }]}>{t("schedule.retry")}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        <ScreenHeader eyebrow={t("schedule.eyebrow")} title={t("schedule.title")} />

        <ScheduleCalendar
          month={viewedMonth}
          year={viewedYear}
          selectedDate={selectedDate}
          dotsByDay={dotsByDay}
          onSelectDate={setSelectedDate}
          onChangeMonth={handleChangeMonth}
        />

        <Text style={[styles.agendaHeading, { color: colors.text }]}>
          {t("schedule.agenda.heading", {
            date: new Intl.DateTimeFormat(i18n.language, {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(parseIsoDateLocal(selectedDate)),
          })}
        </Text>

        {selectedDayEvents.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t("schedule.agenda.empty")}
          </Text>
        ) : (
          <View style={styles.agendaList}>
            {selectedDayEvents.map((event) => (
              <ScheduleAgendaCard
                key={event.installmentId}
                event={event}
                onAction={() => handleAction(event)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 140,
  },
  agendaHeading: {
    fontSize: 20,
    fontWeight: "700",
  },
  agendaList: {
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
});
