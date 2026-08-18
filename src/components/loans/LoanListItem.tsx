import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/general/Icon";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar, type ProgressBarTone } from "@/components/ui/ProgressBar";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/auth";
import type { LoanStatus, LoanSummary } from "@/types/loan";
import { formatCurrency, formatShortDate } from "@/utils/format";

type LoanListItemProps = {
  loan: LoanSummary;
};

type StatusTone = Exclude<BadgeTone, "neutral">;

const STATUS_TONE: Record<LoanStatus, StatusTone> = {
  active: "primary",
  overdue: "danger",
  paid: "success",
};

const PROGRESS_TONE: Record<LoanStatus, ProgressBarTone> = {
  active: "primary",
  overdue: "danger",
  paid: "success",
};

type IoniconName = ComponentProps<typeof Ionicons>["name"];

const STATUS_ICON: Record<LoanStatus, IoniconName> = {
  active: "checkmark-circle",
  overdue: "alert-circle",
  paid: "checkmark-circle",
};

export function LoanListItem({ loan }: LoanListItemProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const currency = useAuthStore((state) => state.user?.currency ?? "USD");

  const statusTone = STATUS_TONE[loan.status];
  const statusColor = colors[statusTone];

  const footerColor =
    loan.status === "overdue" ? colors.danger : loan.status === "paid" ? colors.success : colors.textSecondary;
  const footerIcon: IoniconName =
    loan.status === "overdue" ? "alert-circle" : loan.status === "paid" ? "checkmark-circle" : "calendar-outline";
  const footerLabel =
    loan.status === "overdue"
      ? t("loans.footer.overdue", { count: loan.daysOverdue ?? 0 })
      : loan.status === "paid"
        ? t("loans.footer.paid")
        : t("loans.footer.nextPayment", {
            date: loan.nextPaymentDate ? formatShortDate(loan.nextPaymentDate, i18n.language) : "—",
          });

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.identity}>
          <Text style={[styles.code, { color: colors.textSecondary }]}>#{loan.code}</Text>
          <Text style={[styles.customerName, { color: colors.text }]} numberOfLines={1}>
            {loan.customerName}
          </Text>
        </View>
        <Badge
          tone={statusTone}
          label={t(`loans.status.${loan.status}`)}
          icon={<Icon family="Ionicons" name={STATUS_ICON[loan.status]} size={12} color={statusColor} />}
        />
      </View>

      <Text style={styles.amountLine}>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(loan.totalAmount, currency, i18n.language)}
        </Text>
        <Text style={[styles.amountSuffix, { color: colors.textSecondary }]}> {t("loans.totalSuffix")}</Text>
      </Text>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            {t("loans.progress")}
          </Text>
          <Text style={[styles.progressValue, { color: colors.text }]}>{loan.progressPercent}%</Text>
        </View>
        <ProgressBar progress={loan.progressPercent} tone={PROGRESS_TONE[loan.status]} />
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.footerRow}>
        <View style={styles.footerLeft}>
          <Icon family="Ionicons" name={footerIcon} size={16} color={footerColor} />
          <Text style={[styles.footerLabel, { color: footerColor }]}>{footerLabel}</Text>
        </View>
        <Icon family="Ionicons" name="chevron-forward" size={18} color={colors.textSecondary} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  identity: {
    flex: 1,
    gap: 2,
  },
  code: {
    fontSize: 12,
    fontWeight: "600",
  },
  customerName: {
    fontSize: 17,
    fontWeight: "700",
  },
  amountLine: {
    marginTop: -4,
  },
  amount: {
    fontSize: 20,
    fontWeight: "700",
  },
  amountSuffix: {
    fontSize: 14,
    fontWeight: "500",
  },
  progressSection: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  progressValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
});
