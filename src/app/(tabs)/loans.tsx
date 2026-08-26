import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/general/Icon";
import { LoanListItem } from "@/components/loans/LoanListItem";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SwipeToDelete } from "@/components/ui/SwipeToDelete";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLoans } from "@/hooks/useLoans";
import { ApiError } from "@/services/api";
import { deleteLoan } from "@/services/loans";
import { useApiAlertStore } from "@/store/apiAlert";
import type {
  LoanFilterValue,
  LoanOriginFilter,
  LoanStatusFilter,
  LoanSummary,
} from "@/types/loan";

export default function LoansTabScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<LoanFilterValue>("all");
  const status: LoanStatusFilter = filter === "new" || filter === "legacy" ? "all" : filter;
  const origin: LoanOriginFilter = filter === "new" || filter === "legacy" ? filter : "all";
  const { data, isLoading, isRefreshing, error, refetch } = useLoans(search, status, origin);
  const showApiAlert = useApiAlertStore((state) => state.showApiAlert);

  const filterOptions: { label: string; value: LoanFilterValue }[] = [
    { label: t("loans.filters.all"), value: "all" },
    { label: t("loans.filters.active"), value: "active" },
    { label: t("loans.filters.overdue"), value: "overdue" },
    { label: t("loans.filters.paid"), value: "paid" },
    { label: t("loans.originFilters.new"), value: "new" },
    { label: t("loans.originFilters.legacy"), value: "legacy" },
  ];

  const handleDelete = async (loan: LoanSummary) => {
    try {
      await deleteLoan(loan._id);
      refetch();
    } catch (err) {
      showApiAlert(
        t("loans.delete.errorTitle"),
        err instanceof ApiError ? err.message : t("loans.delete.errorMessage"),
      );
    }
  };

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
          {t("loans.errors.loadFailed")}
        </Text>
        <Pressable onPress={refetch} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
          <Text style={[styles.retryLabel, { color: colors.onPrimary }]}>{t("loans.retry")}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <SwipeToDelete
            onDelete={() => handleDelete(item)}
            actionLabel={t("loans.delete.action")}
            confirmTitle={t("loans.delete.confirmTitle")}
            confirmMessage={t("loans.delete.confirmMessage")}
            cancelLabel={t("loans.delete.cancel")}
            confirmLabel={t("loans.delete.confirm")}
          >
            <LoanListItem loan={item} onPress={() => router.push(`/loan/${item._id}`)} />
          </SwipeToDelete>
        )}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader eyebrow={t("loans.eyebrow")} title={t("loans.title")} />
            <SearchInput
              value={search}
              onChangeText={setSearch}
              placeholder={t("loans.searchPlaceholder")}
            />
            <SegmentedControl options={filterOptions} value={filter} onChange={setFilter} scrollable />
          </View>
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t("loans.empty")}</Text>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <FloatingActionButton
        icon={<Icon family="Ionicons" name="add" size={26} color={colors.onPrimary} />}
        onPress={() => router.push("/loan-form")}
      />
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
    paddingBottom: 140,
  },
  header: {
    gap: 12,
    marginBottom: 16,
  },
  separator: {
    height: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
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
