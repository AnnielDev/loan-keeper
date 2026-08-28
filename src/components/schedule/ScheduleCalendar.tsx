import {
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetMethods,
} from "@expo/ui/community/bottom-sheet";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/general/Icon";
import { Card } from "@/components/ui/Card";
import { CircleIconButton } from "@/components/ui/CircleIconButton";
import { useAppTheme } from "@/hooks/useAppTheme";

export type CalendarDotStatus = "overdue" | "upcoming" | "completed";

type ScheduleCalendarProps = {
  /** 1-12 */
  month: number;
  year: number;
  /** ISO YYYY-MM-DD */
  selectedDate: string;
  /** Keyed by ISO YYYY-MM-DD, one aggregate status per day. */
  dotsByDay: Record<string, CalendarDotStatus>;
  onSelectDate: (isoDate: string) => void;
  onChangeMonth: (delta: number) => void;
  onJumpToMonth: (month: number, year: number) => void;
};

type DayCell = {
  isoDate: string;
  day: number;
  inMonth: boolean;
};

function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function buildMonthGrid(month: number, year: number): DayCell[] {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const cells: DayCell[] = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    cells.push({ isoDate: toIsoDate(prevYear, prevMonth, day), day, inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ isoDate: toIsoDate(year, month, day), day, inMonth: true });
  }

  const trailingCount = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= trailingCount; day++) {
    cells.push({ isoDate: toIsoDate(nextYear, nextMonth, day), day, inMonth: false });
  }

  return cells;
}

function getWeekdayLabels(locale: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
  const sunday = new Date(2023, 0, 1); // a known Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    return formatter.format(date);
  });
}

export function ScheduleCalendar({
  month,
  year,
  selectedDate,
  dotsByDay,
  onSelectDate,
  onChangeMonth,
  onJumpToMonth,
}: ScheduleCalendarProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);
  const pickerSheetRef = useRef<BottomSheetMethods>(null);

  useEffect(() => {
    if (isPickerOpen) {
      setPickerYear(year);
      pickerSheetRef.current?.present();
    } else {
      pickerSheetRef.current?.dismiss();
    }
  }, [isPickerOpen, year]);

  const cells = useMemo(() => buildMonthGrid(month, year), [month, year]);
  const weekdayLabels = useMemo(() => getWeekdayLabels(i18n.language), [i18n.language]);
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, { month: "long", year: "numeric" }).format(
        new Date(year, month - 1, 1),
      ),
    [month, year, i18n.language],
  );
  const monthOptionLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(i18n.language, { month: "short" });
    return Array.from({ length: 12 }, (_, index) => formatter.format(new Date(2023, index, 1)));
  }, [i18n.language]);

  const handlePickMonth = (pickedMonth: number) => {
    setIsPickerOpen(false);
    onJumpToMonth(pickedMonth, pickerYear);
  };

  const dotColor: Record<CalendarDotStatus, string> = {
    overdue: colors.danger,
    upcoming: colors.primary,
    completed: colors.success,
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setIsPickerOpen(true)}
          hitSlop={8}
          style={({ pressed }) => [
            styles.monthLabelButton,
            { backgroundColor: colors.tabPillActive },
            pressed && styles.monthLabelButtonPressed,
          ]}
        >
          <Text style={[styles.monthLabel, { color: colors.primary }]}>{monthLabel}</Text>
          <Icon family="Ionicons" name="chevron-down" size={16} color={colors.primary} />
        </Pressable>
        <View style={styles.navButtons}>
          <CircleIconButton
            tone="neutral"
            onPress={() => onChangeMonth(-1)}
            icon={<Icon family="Ionicons" name="chevron-back" size={18} color={colors.text} />}
          />
          <CircleIconButton
            tone="neutral"
            onPress={() => onChangeMonth(1)}
            icon={<Icon family="Ionicons" name="chevron-forward" size={18} color={colors.text} />}
          />
        </View>
      </View>

      <View style={styles.weekdayRow}>
        {weekdayLabels.map((label, index) => (
          <Text key={index} style={[styles.weekdayLabel, { color: colors.textSecondary }]}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => {
          const isSelected = cell.isoDate === selectedDate;
          const dotStatus = dotsByDay[cell.isoDate];
          const textColor = isSelected
            ? colors.onPrimary
            : cell.inMonth
              ? colors.text
              : colors.textSecondary;

          return (
            <Pressable
              key={cell.isoDate}
              style={styles.dayCell}
              onPress={() => onSelectDate(cell.isoDate)}
              disabled={!cell.inMonth}
            >
              <View style={[styles.dayCircle, isSelected && { backgroundColor: colors.primary }]}>
                <Text style={[styles.dayLabel, { color: textColor }, !cell.inMonth && styles.dimmed]}>
                  {cell.day}
                </Text>
              </View>
              <View
                style={[
                  styles.dot,
                  dotStatus ? { backgroundColor: dotColor[dotStatus] } : styles.dotHidden,
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
            {t("schedule.legend.overdue")}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
            {t("schedule.legend.upcoming")}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
            {t("schedule.legend.completed")}
          </Text>
        </View>
      </View>

      <BottomSheetModal
        ref={pickerSheetRef}
        enableDynamicSizing
        enablePanDownToClose
        onDismiss={() => setIsPickerOpen(false)}
        backgroundStyle={{ backgroundColor: colors.card }}
      >
        <BottomSheetView style={styles.pickerContent}>
          <View style={styles.pickerYearRow}>
            <CircleIconButton
              tone="neutral"
              onPress={() => setPickerYear((current) => current - 1)}
              icon={<Icon family="Ionicons" name="chevron-back" size={18} color={colors.text} />}
            />
            <Text style={[styles.pickerYearLabel, { color: colors.text }]}>{pickerYear}</Text>
            <CircleIconButton
              tone="neutral"
              onPress={() => setPickerYear((current) => current + 1)}
              icon={<Icon family="Ionicons" name="chevron-forward" size={18} color={colors.text} />}
            />
          </View>

          <View style={styles.pickerMonthGrid}>
            {monthOptionLabels.map((label, index) => {
              const pickedMonth = index + 1;
              const isActive = pickerYear === year && pickedMonth === month;
              return (
                <Pressable
                  key={label}
                  onPress={() => handlePickMonth(pickedMonth)}
                  style={[
                    styles.pickerMonthCell,
                    isActive && { backgroundColor: colors.tabPillActive },
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerMonthLabel,
                      { color: isActive ? colors.primary : colors.text },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </Card>
  );
}

const DAY_CIRCLE_SIZE = 34;

const styles = StyleSheet.create({
  card: {
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthLabelButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  monthLabelButtonPressed: {
    opacity: 0.7,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  navButtons: {
    flexDirection: "row",
    gap: 8,
  },
  pickerContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 20,
    alignItems: "stretch",
  },
  pickerYearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  pickerYearLabel: {
    fontSize: 18,
    fontWeight: "700",
    minWidth: 64,
    textAlign: "center",
  },
  pickerMonthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  pickerMonthCell: {
    flexBasis: "33.333%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  pickerMonthLabel: {
    fontSize: 15,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  weekdayRow: {
    flexDirection: "row",
  },
  weekdayLabel: {
    flexBasis: "14.2857%",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    flexBasis: "14.2857%",
    alignItems: "center",
    paddingVertical: 4,
    gap: 4,
  },
  dayCircle: {
    width: DAY_CIRCLE_SIZE,
    height: DAY_CIRCLE_SIZE,
    borderRadius: DAY_CIRCLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  dimmed: {
    opacity: 0.4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotHidden: {
    backgroundColor: "transparent",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
});
