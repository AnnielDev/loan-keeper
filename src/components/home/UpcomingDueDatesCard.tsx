import { router } from "@/utils/navigation";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/auth";
import type { UpcomingDueDate } from "@/types/dashboard";
import { formatCurrency, formatShortDate } from "@/utils/format";

type UpcomingDueDatesCardProps = {
  items: UpcomingDueDate[];
};

export function UpcomingDueDatesCard({ items }: UpcomingDueDatesCardProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const currency = useAuthStore((state) => state.user?.currency ?? "USD");

  return (
    <Card>
      <SectionHeader
        title={t("home.upcoming.title")}
        action={{ label: t("home.upcoming.viewAll"), onPress: () => router.push("/schedule") }}
      />
      {items.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>
          {t("home.upcoming.empty")}
        </Text>
      ) : (
        <View>
          {items.map((item, index) => {
            const isDueToday = item.status === "today";
            const isOverdue = item.status === "overdue";
            const statusColor = isDueToday || isOverdue ? colors.danger : colors.textSecondary;
            const statusLabel = isOverdue
              ? t("home.upcoming.overdue")
              : isDueToday
                ? t("home.upcoming.dueToday")
                : t("home.upcoming.dueInDays", { count: item.daysUntilDue });

            return (
              <View
                key={`${item.customerId}-${item.dueDate}-${index}`}
                style={[
                  styles.row,
                  index > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
                ]}
              >
                <Avatar uri={item.avatarUrl} name={item.customerName} size={44} />
                <View style={styles.info}>
                  <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                    {item.customerName}
                  </Text>
                  <Text style={[styles.status, { color: statusColor }]}>{statusLabel}</Text>
                </View>
                <View style={styles.amountColumn}>
                  <Text style={[styles.amount, { color: colors.primary }]}>
                    {formatCurrency(item.amount, currency, i18n.language)}
                  </Text>
                  <Text style={[styles.date, { color: colors.textSecondary }]}>
                    {formatShortDate(item.dueDate, i18n.language)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
  },
  status: {
    fontSize: 12,
    fontWeight: "500",
  },
  amountColumn: {
    alignItems: "flex-end",
    gap: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: "700",
  },
  date: {
    fontSize: 11,
  },
});
