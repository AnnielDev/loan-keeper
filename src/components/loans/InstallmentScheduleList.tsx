import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Checkbox } from "@/components/ui/Checkbox";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/auth";
import { formatCurrency, formatShortDateFromDate } from "@/utils/format";
import type { LoanInstallmentPreview } from "@/utils/loanCalculator";

type InstallmentScheduleListProps = {
  installments: LoanInstallmentPreview[];
  selection?: {
    isChecked: (index: number) => boolean;
    onToggle: (index: number) => void;
  };
};

export function InstallmentScheduleList({
  installments,
  selection,
}: InstallmentScheduleListProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const currency = useAuthStore((state) => state.user?.currency ?? "USD");

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {installments.map((installment, index) => (
        <Pressable
          key={index}
          onPress={selection ? () => selection.onToggle(index) : undefined}
          style={[
            styles.row,
            index > 0 && {
              borderTopColor: colors.border,
              borderTopWidth: StyleSheet.hairlineWidth,
            },
          ]}
        >
          {selection ? (
            <Checkbox
              checked={selection.isChecked(index)}
              onToggle={() => selection.onToggle(index)}
            />
          ) : null}
          <Text
            style={[styles.installmentNumber, { color: colors.textSecondary }]}
          >
            {t("loanForm.schedule.installmentNumber", { number: index + 1 })}
          </Text>
          <Text style={[styles.date, { color: colors.text }]}>
            {formatShortDateFromDate(installment.dueDate, i18n.language)}
          </Text>
          <Text style={[styles.amount, { color: colors.text }]}>
            {formatCurrency(installment.amount, currency, i18n.language)}
          </Text>
        </Pressable>
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
  amount: { fontSize: 13, fontWeight: "700", textAlign: "right" },
});
