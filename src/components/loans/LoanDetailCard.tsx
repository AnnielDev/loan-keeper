import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/general/Icon";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ProgressBar, type ProgressBarTone } from "@/components/ui/ProgressBar";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/auth";
import type { CustomerLoanSummary } from "@/types/customer";
import { formatCurrency, formatShortDate } from "@/utils/format";

type LoanDetailCardProps = {
  loan: CustomerLoanSummary;
  onPress: () => void;
  onRegisterPayment: () => void;
};

const PROGRESS_TONE: Record<CustomerLoanSummary["status"], ProgressBarTone> = {
  active: "primary",
  overdue: "danger",
  paid: "success",
};

export function LoanDetailCard({
  loan,
  onPress,
  onRegisterPayment,
}: LoanDetailCardProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const currency = useAuthStore((state) => state.user?.currency ?? "USD");

  const statusColor =
    loan.status === "overdue" ? colors.danger : colors.success;
  const statusLabel = t(`loans.status.${loan.status}`);
  const secondaryLabel =
    loan.status === "overdue"
      ? t("loans.footer.overdue", { count: loan.daysOverdue ?? 0 })
      : loan.nextPaymentDate
        ? t("customerDetail.loans.nextPaymentShort", {
            date: formatShortDate(loan.nextPaymentDate, i18n.language),
          })
        : null;

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.identity}>
            <Badge tone="warning" label={t(`loans.type.${loan.type}`)} />
            <Text style={[styles.code, { color: colors.textSecondary }]}>
              #{loan.code}
            </Text>
          </View>
          <View style={styles.statusColumn}>
            <Text style={[styles.statusLabel, { color: statusColor }]}>
              {statusLabel}
            </Text>
            {secondaryLabel ? (
              <Text
                style={[styles.secondaryLabel, { color: colors.textSecondary }]}
              >
                {secondaryLabel}
              </Text>
            ) : null}
          </View>
        </View>

        <Text style={[styles.capital, { color: colors.text }]}>
          {t("customerDetail.loans.capital")}:{" "}
          {formatCurrency(loan.principal, currency, i18n.language)}
        </Text>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text
              style={[styles.progressLabel, { color: colors.textSecondary }]}
            >
              {t("customerDetail.loans.paymentProgress", {
                percent: loan.progressPercent,
              })}
            </Text>
            <Text style={[styles.progressValue, { color: colors.text }]}>
              {formatCurrency(loan.paidAmount, currency, i18n.language)} /{" "}
              {formatCurrency(loan.totalAmount, currency, i18n.language)}
            </Text>
          </View>
          <ProgressBar
            progress={loan.progressPercent}
            tone={PROGRESS_TONE[loan.status]}
          />
        </View>

        {loan.status !== "paid" && loan.nextInstallmentId ? (
          <PrimaryButton
            tone="success"
            label={t("customerDetail.loans.registerPayment")}
            icon={
              <Icon
                family="Ionicons"
                name="card-outline"
                size={18}
                color={colors.success}
              />
            }
            onPress={onRegisterPayment}
          />
        ) : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  identity: {
    gap: 6,
  },
  code: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusColumn: {
    alignItems: "flex-end",
    gap: 2,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  secondaryLabel: {
    fontSize: 12,
  },
  capital: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressSection: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: "column",
    gap: 4,
    borderWidth: 1,
    padding: 4,
    borderRadius: 6,
    borderColor: "#F9FAFB",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  progressValue: {
    fontSize: 13,
    fontWeight: "700",
  },
});
