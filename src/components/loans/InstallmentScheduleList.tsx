import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/auth";
import type { LoanInstallmentPreview } from "@/utils/loanCalculator";
import { formatCurrency, formatShortDate } from "@/utils/format";

type InstallmentScheduleListProps = {
  installments: LoanInstallmentPreview[];
};

export function InstallmentScheduleList({ installments }: InstallmentScheduleListProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const currency = useAuthStore((state) => state.user?.currency ?? "USD");

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {installments.map((installment, index) => (
        <View
          key={index}
          style={[
            styles.row,
            index > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
          ]}
        >
          <Text style={[styles.installmentNumber, { color: colors.textSecondary }]}>
            {t("loanForm.schedule.installmentNumber", { number: index + 1 })}
          </Text>
          <Text style={[styles.date, { color: colors.text }]}>
            {formatShortDate(installment.dueDate.toISOString(), i18n.language)}
          </Text>
          <Text style={[styles.amount, { color: colors.text }]}>
            {formatCurrency(installment.amount, currency, i18n.language)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  installmentNumber: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },
  date: {
    fontSize: 13,
  },
  amount: {
    width: 90,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
  },
});
