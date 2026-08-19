import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/general/Icon";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/auth";
import type { LoanDetailInstallment } from "@/types/loan";
import { formatCurrency, formatShortDate } from "@/utils/format";

type InstallmentTimelineRowProps = {
  installment: LoanDetailInstallment;
  total: number;
  onAction: () => void;
};

const BAR_COLOR_KEY: Record<LoanDetailInstallment["status"], "success" | "danger" | "border"> = {
  paid: "success",
  overdue: "danger",
  pending: "border",
};

const BADGE_TONE: Record<LoanDetailInstallment["status"], BadgeTone> = {
  paid: "success",
  overdue: "danger",
  pending: "neutral",
};

export function InstallmentTimelineRow({ installment, total, onAction }: InstallmentTimelineRowProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const currency = useAuthStore((state) => state.user?.currency ?? "USD");

  const barColor = colors[BAR_COLOR_KEY[installment.status]];
  const actionLabel =
    installment.status === "overdue" ? t("loanDetail.actions.collect") : t("loanDetail.actions.advance");

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.bar, { backgroundColor: barColor }]} />
        <View style={styles.info}>
          <Text style={[styles.installmentLabel, { color: colors.text }]}>
            {t("loanDetail.installmentLabel", { index: installment.index, total })}
          </Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {formatShortDate(installment.dueDate, i18n.language)}
          </Text>
        </View>
        <View style={styles.amountColumn}>
          <Text style={[styles.amount, { color: colors.text }]}>
            {formatCurrency(installment.amount, currency, i18n.language)}
          </Text>
          <Badge tone={BADGE_TONE[installment.status]} label={t(`loanDetail.installmentStatus.${installment.status}`)} />
        </View>
      </View>

      {installment.status !== "paid" ? (
        <Pressable onPress={onAction} style={[styles.actionRow, { borderTopColor: colors.border }]}>
          <Icon family="Ionicons" name="card-outline" size={16} color={colors.primary} />
          <Text style={[styles.actionLabel, { color: colors.primary }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
    padding: 16,
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
  info: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  installmentLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  date: {
    fontSize: 13,
  },
  amountColumn: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 6,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
});
