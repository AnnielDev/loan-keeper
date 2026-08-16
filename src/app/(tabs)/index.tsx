import { router } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/general/Icon";
import { MonthlyIncomeChart } from "@/components/home/MonthlyIncomeChart";
import { UpcomingDueDatesCard } from "@/components/home/UpcomingDueDatesCard";
import { WelcomeBanner } from "@/components/home/WelcomeBanner";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuthStore } from "@/store/auth";
import { formatCurrency } from "@/utils/format";

export default function HomeTabScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { data, isLoading, isRefreshing, error, refetch } = useDashboard();

  const currency = user?.currency ?? "USD";

  useEffect(() => {
    if (data) updateUser({ balance: data.balance });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.balance]);

  if (isLoading) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          {t("home.errors.loadFailed")}
        </Text>
        <Pressable
          onPress={refetch}
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.retryLabel, { color: colors.onPrimary }]}>
            {t("home.retry")}
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!data) return null;

  const growth = data.totalLoaned.growthPercentage;
  const isGrowthPositive = growth >= 0;

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      >
        <WelcomeBanner
          name={user?.name ?? ""}
          pendingToday={data.pendingToday}
        />
        <View style={styles.row}>
          <StatCard
            layout="card"
            tone={data.balance < 0 ? "danger" : "success"}
            icon={
              <Icon
                family="MaterialCommunityIcons"
                name="wallet-outline"
                size={20}
                color={colors.onPrimary}
              />
            }
            label={t("home.stats.balance")}
            value={formatCurrency(data.balance, currency, i18n.language)}
          />

          <StatCard
            layout="card"
            tone="primary"
            icon={
              <Icon
                family="MaterialCommunityIcons"
                name="hand-coin-outline"
                size={20}
                color={colors.onPrimary}
              />
            }
            label={t("home.stats.totalLoaned")}
            value={formatCurrency(
              data.totalLoaned.amount,
              currency,
              i18n.language,
            )}
            trailing={
              <Badge
                tone={isGrowthPositive ? "success" : "danger"}
                label={`${isGrowthPositive ? "+" : ""}${growth}%`}
                icon={
                  <Icon
                    family="Ionicons"
                    name={isGrowthPositive ? "trending-up" : "trending-down"}
                    size={14}
                    color={isGrowthPositive ? colors.success : colors.danger}
                  />
                }
              />
            }
          />
        </View>

        <View style={styles.row}>
          <StatCard
            layout="card"
            tone="success"
            inline
            icon={
              <Icon
                family="MaterialCommunityIcons"
                name="cash-check"
                size={20}
                color={colors.onPrimary}
              />
            }
            label={t("home.stats.collected")}
            value={formatCurrency(
              data.collected.amount,
              currency,
              i18n.language,
            )}
          />
          <StatCard
            layout="card"
            tone="danger"
            inline
            icon={
              <Icon
                family="MaterialCommunityIcons"
                name="clock-alert-outline"
                size={20}
                color={colors.onPrimary}
              />
            }
            label={t("home.stats.pending")}
            value={formatCurrency(data.pending.amount, currency, i18n.language)}
          />
        </View>

        <View style={styles.row}>
          <StatCard
            layout="pill"
            tone="primary"
            icon={
              <Icon
                family="MaterialCommunityIcons"
                name="account-multiple-outline"
                size={16}
                color={colors.onPrimary}
              />
            }
            label={t("home.stats.customers")}
            value={String(data.stats.customers)}
            onPress={() => router.push("/customers")}
          />
          <StatCard
            layout="pill"
            tone="success"
            icon={
              <Icon
                family="Ionicons"
                name="checkmark-circle-outline"
                size={16}
                color={colors.onPrimary}
              />
            }
            label={t("home.stats.active")}
            value={String(data.stats.active)}
            onPress={() => router.push("/loans")}
          />
          <StatCard
            layout="pill"
            tone="danger"
            icon={
              <Icon
                family="Ionicons"
                name="warning-outline"
                size={16}
                color={colors.onPrimary}
              />
            }
            label={t("home.stats.overdue")}
            value={String(data.stats.overdue)}
            onPress={() => router.push("/loans")}
          />
        </View>

        <MonthlyIncomeChart data={data.monthlyIncome} />

        <UpcomingDueDatesCard items={data.upcomingDueDates} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 140,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
});
