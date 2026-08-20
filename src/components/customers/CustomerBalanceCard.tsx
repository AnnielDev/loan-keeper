import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import { RiskMeter } from "@/components/customers/RiskMeter";
import { Card } from "@/components/ui/Card";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/auth";
import type { RiskLevel } from "@/types/customer";
import { formatCurrency } from "@/utils/format";

type CustomerBalanceCardProps = {
  pendingBalance: number;
  riskLevel: RiskLevel;
};

export function CustomerBalanceCard({
  pendingBalance,
  riskLevel,
}: CustomerBalanceCardProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const currency = useAuthStore((state) => state.user?.currency ?? "USD");

  return (
    <Card backgroundColor={colors.primary} style={styles.card}>
      <View style={styles.topRow}>
        <Text style={[styles.label, { color: colors.onPrimary }]}>
          {t("customerDetail.pendingBalance").toUpperCase()}
        </Text>
        <RiskMeter level={riskLevel} />
      </View>
      <Text style={[styles.amount, { color: colors.onPrimary }]}>
        {formatCurrency(pendingBalance, currency, i18n.language)}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 30,
    fontWeight: "700",
  },
});
