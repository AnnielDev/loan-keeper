import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar, type ProgressBarTone } from "@/components/ui/ProgressBar";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/auth";
import type { CustomerLoanSummary } from "@/types/customer";
import { formatCurrency, formatMediumDate } from "@/utils/format";

type LoanHistoryListItemProps = {
  loan: CustomerLoanSummary;
  onPress: () => void;
};

const BADGE_TONE: Record<CustomerLoanSummary["status"], BadgeTone> = {
  active: "success",
  overdue: "danger",
  paid: "neutral",
};

const PROGRESS_TONE: Record<CustomerLoanSummary["status"], ProgressBarTone> = {
  active: "primary",
  overdue: "danger",
  paid: "success",
};

export function LoanHistoryListItem({ loan, onPress }: LoanHistoryListItemProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const currency = useAuthStore((state) => state.user?.currency ?? "USD");

  const accentColor =
    loan.status === "overdue" ? colors.danger : loan.status === "paid" ? colors.border : colors.success;

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={[styles.accent, { backgroundColor: accentColor }]} />
        <View style={styles.body}>
          <View style={styles.topRow}>
            <View style={styles.identity}>
              <Text style={[styles.type, { color: colors.text }]} numberOfLines={1}>
                {t(`loans.type.${loan.type}`)}
              </Text>
              <Text style={[styles.code, { color: colors.textSecondary }]}>#{loan.code}</Text>
            </View>
            <Badge tone={BADGE_TONE[loan.status]} label={t(`customerHistory.status.${loan.status}`)} />
          </View>

          <Text style={[styles.issued, { color: colors.textSecondary }]}>
            {t("customerHistory.issued")}: {formatMediumDate(loan.startDate, i18n.language)}
          </Text>

          <View style={styles.amountRow}>
            <Text style={[styles.amount, { color: colors.text }]}>
              {formatCurrency(loan.principal, currency, i18n.language)}
            </Text>
            <Text style={[styles.percent, { color: colors.textSecondary }]}>
              {t("customerHistory.percentPaid", { percent: loan.progressPercent })}
            </Text>
          </View>

          <ProgressBar progress={loan.progressPercent} tone={PROGRESS_TONE[loan.status]} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 0,
    overflow: "hidden",
  },
  accent: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  identity: {
    gap: 2,
  },
  type: {
    fontSize: 15,
    fontWeight: "700",
  },
  code: {
    fontSize: 12,
    fontWeight: "600",
  },
  issued: {
    fontSize: 12,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
  percent: {
    fontSize: 13,
    fontWeight: "600",
  },
});
