import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { MonthlyIncomePoint } from "@/types/dashboard";
import { formatCompactNumber } from "@/utils/format";

const CHART_HEIGHT = 120;
const MIN_BAR_HEIGHT = 6;

type MonthlyIncomeChartProps = {
  data: MonthlyIncomePoint[];
};

export function MonthlyIncomeChart({ data }: MonthlyIncomeChartProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();

  const maxAmount = Math.max(0, ...data.map((point) => point.amount));
  const peakIndex = maxAmount > 0 ? data.findIndex((point) => point.amount === maxAmount) : -1;

  return (
    <Card>
      <SectionHeader title={t("home.chart.title")} />
      <View style={styles.chart}>
        {data.map((point, index) => {
          const isPeak = index === peakIndex;
          const barHeight =
            maxAmount > 0
              ? Math.max(MIN_BAR_HEIGHT, (point.amount / maxAmount) * CHART_HEIGHT)
              : MIN_BAR_HEIGHT;

          return (
            <View key={`${point.month}-${index}`} style={styles.barColumn}>
              {isPeak && (
                <View style={[styles.bubble, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.bubbleText, { color: colors.onPrimary }]}>
                    {formatCompactNumber(point.amount, i18n.language)}
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.bar,
                  { height: barHeight, backgroundColor: isPeak ? colors.primary : colors.border },
                ]}
              />
              <Text style={[styles.monthLabel, { color: colors.textSecondary }]}>
                {point.month}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
  },
  bubble: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  bubbleText: {
    fontSize: 11,
    fontWeight: "700",
  },
  bar: {
    width: "60%",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  monthLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "600",
  },
});
