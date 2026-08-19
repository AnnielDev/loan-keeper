import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/general/Icon";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/auth";
import type { CustomerLoanSummary } from "@/types/customer";
import { formatCurrency, formatShortDate } from "@/utils/format";

type LoanCompactRowProps = {
  loan: CustomerLoanSummary;
  onPress: () => void;
};

export function LoanCompactRow({ loan, onPress }: LoanCompactRowProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const currency = useAuthStore((state) => state.user?.currency ?? "USD");

  const isOverdue = loan.status === "overdue";
  const isPaid = loan.status === "paid";
  const accentColor = isOverdue ? colors.danger : isPaid ? colors.success : colors.textSecondary;
  const iconBackground = isOverdue ? colors.dangerSurface : isPaid ? colors.successSurface : colors.surface;
  const iconName = isOverdue ? "alert" : isPaid ? "checkmark" : "time-outline";

  const statusLabel = isOverdue
    ? t("loans.footer.overdue", { count: loan.daysOverdue ?? 0 })
    : isPaid
      ? t("loans.footer.paid")
      : loan.nextPaymentDate
        ? t("loans.footer.nextPayment", { date: formatShortDate(loan.nextPaymentDate, i18n.language) })
        : null;

  const pendingAmount = loan.totalAmount - loan.paidAmount;

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={[styles.iconBadge, { backgroundColor: iconBackground }]}>
        <Icon family="Ionicons" name={iconName} size={18} color={accentColor} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {t(`loans.type.${loan.type}`)} #{loan.code}
        </Text>
        {statusLabel ? <Text style={[styles.status, { color: accentColor }]}>{statusLabel}</Text> : null}
      </View>
      <Text style={[styles.amount, { color: colors.text }]}>
        {formatCurrency(pendingAmount, currency, i18n.language)}
      </Text>
      <Icon family="Ionicons" name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
  },
});
