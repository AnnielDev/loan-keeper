import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { MonthlyIncomePoint } from "@/types/dashboard";
import { formatCurrency } from "@/utils/format";

const CHART_HEIGHT = 120;
const MIN_BAR_HEIGHT = 6;

type SeriesKey = "collected" | "loaned";

/** Fixed chart identity colors, validated for CVD/lightness/contrast against
 * both the light (#FFFFFF) and dark (#1F2937) card surfaces — see the dataviz
 * skill's validate_palette.js. Kept independent of the theme's primary/success
 * tokens (which don't clear the lightness band on both surfaces) so the pair
 * stays legible across light and dark without per-mode branching. */
const SERIES_COLOR: Record<SeriesKey, string> = {
  collected: "#16A34A",
  loaned: "#2F7BFF",
};

type MonthlyIncomeChartProps = {
  data: MonthlyIncomePoint[];
  currency: string;
};

export function MonthlyIncomeChart({ data, currency }: MonthlyIncomeChartProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();

  const maxAmount = Math.max(0, ...data.flatMap((point) => [point.collected, point.loaned]));
  const [selectedPoint, setSelectedPoint] = useState<MonthlyIncomePoint | null>(null);

  const seriesLabel: Record<SeriesKey, string> = {
    collected: t("home.chart.legend.collected"),
    loaned: t("home.chart.legend.loaned"),
  };

  return (
    <Card>
      <SectionHeader title={t("home.chart.title")} />
      <View style={styles.legend}>
        {(["collected", "loaned"] as SeriesKey[]).map((series) => (
          <View key={series} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: SERIES_COLOR[series] }]} />
            <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
              {seriesLabel[series]}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.chart}>
        {data.map((point, index) => (
          <Pressable
            key={`${point.month}-${index}`}
            style={styles.barColumn}
            onPress={() => setSelectedPoint(point)}
            hitSlop={4}
          >
            <View style={styles.barGroup}>
              {(["collected", "loaned"] as SeriesKey[]).map((series) => {
                const value = point[series];
                const barHeight =
                  maxAmount > 0
                    ? Math.max(MIN_BAR_HEIGHT, (value / maxAmount) * CHART_HEIGHT)
                    : MIN_BAR_HEIGHT;

                return (
                  <View
                    key={series}
                    style={[
                      styles.bar,
                      { height: barHeight, backgroundColor: SERIES_COLOR[series] },
                    ]}
                  />
                );
              })}
            </View>
            <Text style={[styles.monthLabel, { color: colors.textSecondary }]}>
              {point.month}
            </Text>
          </Pressable>
        ))}
      </View>

      <Modal
        visible={selectedPoint !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPoint(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSelectedPoint(null)}>
          <Pressable style={[styles.dialog, { backgroundColor: colors.card }]} onPress={() => {}}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>
              {selectedPoint?.month}
            </Text>
            {(["collected", "loaned"] as SeriesKey[]).map((series) => (
              <View key={series} style={styles.dialogRow}>
                <View style={styles.dialogRowLabel}>
                  <View
                    style={[styles.legendSwatch, { backgroundColor: SERIES_COLOR[series] }]}
                  />
                  <Text style={[styles.dialogLabel, { color: colors.textSecondary }]}>
                    {seriesLabel[series]}
                  </Text>
                </View>
                <Text style={[styles.dialogAmount, { color: colors.text }]}>
                  {selectedPoint
                    ? formatCurrency(selectedPoint[series], currency, i18n.language)
                    : ""}
                </Text>
              </View>
            ))}
            <Pressable
              onPress={() => setSelectedPoint(null)}
              style={styles.closeButton}
            >
              <Text style={[styles.closeLabel, { color: colors.primary }]}>
                {t("home.chart.close")}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </Card>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendSwatch: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
  },
  barGroup: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },
  bar: {
    width: 14,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  monthLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "600",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    gap: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  dialogRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dialogRowLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dialogLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  dialogAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  closeButton: {
    alignItems: "center",
    paddingTop: 4,
  },
  closeLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
});
