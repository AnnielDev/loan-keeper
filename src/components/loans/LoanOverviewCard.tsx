import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/general/Icon";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ProgressBar, type ProgressBarTone } from "@/components/ui/ProgressBar";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/auth";
import type { LoanDetail } from "@/types/loan";
import { formatCurrency } from "@/utils/format";

type LoanOverviewCardProps = {
  loan: LoanDetail;
  onRegisterPayment: () => void;
};

const STATUS_TONE: Record<LoanDetail["status"], BadgeTone> = {
  active: "primary",
  overdue: "danger",
  paid: "success",
};

const PROGRESS_TONE: Record<LoanDetail["status"], ProgressBarTone> = {
  active: "primary",
  overdue: "danger",
  paid: "success",
};

export function LoanOverviewCard({ loan, onRegisterPayment }: LoanOverviewCardProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const currency = useAuthStore((state) => state.user?.currency ?? "USD");

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {t("loanDetail.title", { code: loan.code })}
        </Text>
        <Badge tone={STATUS_TONE[loan.status]} label={t(`loanDetail.status.${loan.status}`).toUpperCase()} />
      </View>
      <Text style={[styles.customerName, { color: colors.primary }]}>{loan.customerName}</Text>

      <View style={styles.grid}>
        <View style={styles.gridCell}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            {t("loanDetail.fields.principal")}
          </Text>
          <Text style={[styles.fieldValue, { color: colors.text }]}>
            {formatCurrency(loan.principal, currency, i18n.language)}
          </Text>
        </View>
        <View style={styles.gridCell}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            {t("loanDetail.fields.interestRate")}
          </Text>
          <Text style={[styles.fieldValue, { color: colors.text }]}>{loan.interestRate}%</Text>
        </View>
        <View style={styles.gridCell}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            {t("loanDetail.fields.totalAmount")}
          </Text>
          <Text style={[styles.fieldValue, { color: colors.text }]}>
            {formatCurrency(loan.totalAmount, currency, i18n.language)}
          </Text>
        </View>
        <View style={styles.gridCell}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            {t("loanDetail.fields.remainingBalance")}
          </Text>
          <Text style={[styles.fieldValue, { color: colors.primary }]}>
            {formatCurrency(loan.remainingBalance, currency, i18n.language)}
          </Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            {t("loanDetail.progress")}
          </Text>
          <Text style={[styles.progressValue, { color: colors.text }]}>{loan.progressPercent}%</Text>
        </View>
        <ProgressBar progress={loan.progressPercent} tone={PROGRESS_TONE[loan.status]} />
      </View>

      {loan.status !== "paid" && loan.nextInstallmentId ? (
        <PrimaryButton
          label={t("loanDetail.registerPayment")}
          icon={<Icon family="Ionicons" name="card-outline" size={20} color={colors.onPrimary} />}
          onPress={onRegisterPayment}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
  },
  customerName: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: -12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridCell: {
    width: "50%",
    gap: 2,
    paddingVertical: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  fieldValue: {
    fontSize: 17,
    fontWeight: "700",
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
});
