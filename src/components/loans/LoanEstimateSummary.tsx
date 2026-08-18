import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/general/Icon";
import { Card } from "@/components/ui/Card";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/auth";
import type { LoanCalculation } from "@/utils/loanCalculator";
import { formatCurrency } from "@/utils/format";

type LoanEstimateSummaryProps = {
  calculation: LoanCalculation;
};

export function LoanEstimateSummary({ calculation }: LoanEstimateSummaryProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const currency = useAuthStore((state) => state.user?.currency ?? "USD");

  const format = (amount: number) => formatCurrency(amount, currency, i18n.language);

  return (
    <Card backgroundColor={colors.primary} style={styles.card}>
      <View style={styles.header}>
        <Icon family="Ionicons" name="bar-chart-outline" size={16} color={colors.onPrimary} />
        <Text style={[styles.headerLabel, { color: colors.onPrimary }]}>
          {t("loanForm.summary.title")}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.onPrimary }]}>
          {t("loanForm.summary.installmentAmount")}
        </Text>
        <Text style={[styles.value, { color: colors.onPrimary }]}>
          {format(calculation.installmentAmount)}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.onPrimary }]} />

      <View style={styles.columns}>
        <View style={styles.column}>
          <Text style={[styles.label, { color: colors.onPrimary }]}>
            {t("loanForm.summary.totalInterest")}
          </Text>
          <Text style={[styles.columnValue, { color: colors.onPrimary }]}>
            {format(calculation.totalInterest)}
          </Text>
        </View>
        <View style={[styles.column, styles.columnEnd]}>
          <Text style={[styles.label, { color: colors.onPrimary }]}>
            {t("loanForm.summary.totalAmount")}
          </Text>
          <Text style={[styles.columnValue, { color: colors.onPrimary }]}>
            {format(calculation.totalAmount)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 13,
    opacity: 0.85,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    opacity: 0.3,
  },
  columns: {
    flexDirection: "row",
  },
  column: {
    flex: 1,
    gap: 4,
  },
  columnEnd: {
    alignItems: "flex-end",
  },
  columnValue: {
    fontSize: 17,
    fontWeight: "700",
  },
});
