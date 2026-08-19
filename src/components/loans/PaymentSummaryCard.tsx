import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/auth";
import { formatCurrency } from "@/utils/format";

type PaymentSummaryCardProps = {
  loanCode: string;
  customerName: string;
  amount: number;
};

export function PaymentSummaryCard({ loanCode, customerName, amount }: PaymentSummaryCardProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const currency = useAuthStore((state) => state.user?.currency ?? "USD");

  return (
    <Card backgroundColor={colors.primary} style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.eyebrow}>{t("paymentForm.loanLabel")}</Text>
          <Text style={styles.loanCode}>#{loanCode}</Text>
        </View>
        <Text style={styles.customerName} numberOfLines={1}>
          {customerName}
        </Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.nextLabel}>{t("paymentForm.nextInstallmentLabel")}</Text>
      <View style={styles.amountRow}>
        <Text style={styles.amount}>{formatCurrency(amount, currency, i18n.language)}</Text>
        <Text style={styles.currencyCode}>{currency}</Text>
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
  eyebrow: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.75)",
  },
  loanCode: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  customerName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  nextLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.75)",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  amount: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  currencyCode: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.75)",
    marginBottom: 4,
  },
});
