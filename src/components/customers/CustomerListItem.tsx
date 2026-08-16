import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/auth";
import type { CustomerSummary } from "@/types/customer";
import { formatCurrency } from "@/utils/format";

type CustomerListItemProps = {
  customer: CustomerSummary;
};

export function CustomerListItem({ customer }: CustomerListItemProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const currency = useAuthStore((state) => state.user?.currency ?? "USD");

  const isOverdue = customer.status === "overdue";
  const statusColor = isOverdue ? colors.danger : colors.success;

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <Avatar uri={customer.avatarUrl} name={customer.fullName} size={48} />
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
            {customer.fullName}
          </Text>
          {customer.phone ? (
            <Text style={[styles.phone, { color: colors.textSecondary }]}>{customer.phone}</Text>
          ) : null}
        </View>
        <Badge
          tone={isOverdue ? "danger" : "success"}
          label={t(isOverdue ? "customers.status.overdue" : "customers.status.active")}
          icon={<View style={[styles.dot, { backgroundColor: statusColor }]} />}
        />
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View>
        <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
          {t("customers.pendingBalance").toUpperCase()}
        </Text>
        <Text style={[styles.balanceAmount, { color: isOverdue ? colors.danger : colors.text }]}>
          {formatCurrency(customer.pendingBalance, currency, i18n.language)}
        </Text>
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
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
  },
  phone: {
    fontSize: 13,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: "700",
  },
});
