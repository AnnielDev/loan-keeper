import { useLocalSearchParams } from "expo-router";

import { router } from "@/utils/navigation";
import { useMemo, useState } from "react";
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
import { LoanHistoryListItem } from "@/components/loans/LoanHistoryListItem";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StatCard } from "@/components/ui/StatCard";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useCustomerDetail } from "@/hooks/useCustomerDetail";
import { useAuthStore } from "@/store/auth";
import type { LoanStatusFilter } from "@/types/loan";
import { formatCurrency } from "@/utils/format";

export default function CustomerHistoryScreen() {
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const currency = useAuthStore((state) => state.user?.currency ?? "USD");
  const { data, isLoading, isRefreshing, error, refetch } = useCustomerDetail(customerId);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LoanStatusFilter>("all");
  const [expanded, setExpanded] = useState(false);

  const filterOptions: { label: string; value: LoanStatusFilter }[] = [
    { label: t("customerHistory.filters.all"), value: "all" },
    { label: t("customerHistory.filters.active"), value: "active" },
    { label: t("customerHistory.filters.paid"), value: "paid" },
    { label: t("customerHistory.filters.overdue"), value: "overdue" },
  ];

  const isFiltering = search.trim().length > 0 || statusFilter !== "all";

  const filteredLoans = useMemo(() => {
    if (!data) return [];
    const query = search.trim().toLowerCase();
    return data.loans.filter((loan) => {
      const matchesSearch = !query || loan.code.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || loan.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter]);

  const visibleLoans = expanded || isFiltering ? filteredLoans : filteredLoans.slice(0, 3);
  const remainingCount = filteredLoans.length - visibleLoans.length;

  const totalLoansCount = data?.loans.length ?? 0;
  const activeLoansCount = data?.loans.filter((loan) => loan.status !== "paid").length ?? 0;

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          {t("customerDetail.errors.loadFailed")}
        </Text>
        <Pressable onPress={refetch} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
          <Text style={[styles.retryLabel, { color: colors.onPrimary }]}>{t("customerDetail.retry")}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!data) return null;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Icon family="Ionicons" name="chevron-back" size={26} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder={t("customerHistory.searchPlaceholder")}
        />
        <SegmentedControl options={filterOptions} value={statusFilter} onChange={setStatusFilter} scrollable />

        <Card style={styles.profileCard}>
          <Avatar uri={data.avatarUrl} name={data.fullName} size={56} />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]} numberOfLines={1}>
              {data.fullName}
            </Text>
            <Text style={[styles.profileVolume, { color: colors.primary }]}>
              {t("customerHistory.totalVolume")}: {formatCurrency(data.totalLoaned, currency, i18n.language)}
            </Text>
          </View>
        </Card>

        <View style={styles.statsRow}>
          <StatCard
            icon={<Icon family="Ionicons" name="time-outline" size={18} color={colors.onPrimary} />}
            label={t("customerHistory.stats.totalLoans")}
            value={String(totalLoansCount)}
            style={styles.statCard}
          />
          <StatCard
            icon={<Icon family="Ionicons" name="trending-up-outline" size={18} color={colors.onPrimary} />}
            label={t("customerHistory.stats.activeLoans")}
            value={String(activeLoansCount)}
            tone="success"
            style={styles.statCard}
          />
        </View>

        <View style={[styles.totalPaidCard, { backgroundColor: colors.primary }]}>
          <Text style={[styles.totalPaidLabel, { color: colors.onPrimary }]}>
            {t("customerHistory.totalPaidToDate")}
          </Text>
          <Text style={[styles.totalPaidValue, { color: colors.onPrimary }]}>
            {formatCurrency(data.totalCollected, currency, i18n.language)}
          </Text>
        </View>

        <SectionHeader title={t("customerHistory.sectionTitle")} />

        {filteredLoans.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t("customerHistory.empty")}
          </Text>
        ) : (
          <View style={styles.loanList}>
            {visibleLoans.map((loan) => (
              <LoanHistoryListItem
                key={loan._id}
                loan={loan}
                onPress={() => router.push(`/loan/${loan._id}`)}
              />
            ))}
          </View>
        )}

        {remainingCount > 0 ? (
          <Pressable onPress={() => setExpanded(true)} style={styles.showMoreButton}>
            <Text style={[styles.showMoreLabel, { color: colors.primary }]}>
              {t("customerHistory.showMore", { count: remainingCount })}
            </Text>
            <Icon family="Ionicons" name="chevron-down" size={16} color={colors.primary} />
          </Pressable>
        ) : null}
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
  },
  profileVolume: {
    fontSize: 13,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  totalPaidCard: {
    borderRadius: 20,
    padding: 18,
    gap: 6,
  },
  totalPaidLabel: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    opacity: 0.85,
  },
  totalPaidValue: {
    fontSize: 26,
    fontWeight: "700",
  },
  loanList: {
    gap: 12,
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  showMoreLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
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
