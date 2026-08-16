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
import { CustomerListItem } from "@/components/customers/CustomerListItem";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useCustomers } from "@/hooks/useCustomers";
import type { CustomerStatusFilter } from "@/types/customer";

export default function CustomersTabScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CustomerStatusFilter>("all");
  const { data, isLoading, isRefreshing, error, refetch } = useCustomers(search, status);

  const filterOptions: { label: string; value: CustomerStatusFilter }[] = [
    { label: t("customers.filters.all"), value: "all" },
    { label: t("customers.filters.active"), value: "active" },
    { label: t("customers.filters.overdue"), value: "overdue" },
  ];

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          {t("customers.errors.loadFailed")}
        </Text>
        <Pressable onPress={refetch} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
          <Text style={[styles.retryLabel, { color: colors.onPrimary }]}>{t("customers.retry")}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <CustomerListItem customer={item} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader eyebrow={t("customers.eyebrow")} title={t("customers.title")} />
            <SearchInput
              value={search}
              onChangeText={setSearch}
              placeholder={t("customers.searchPlaceholder")}
            />
            <SegmentedControl options={filterOptions} value={status} onChange={setStatus} />
          </View>
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t("customers.empty")}
          </Text>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <FloatingActionButton
        icon={<Icon family="Ionicons" name="person-add" size={24} color={colors.onPrimary} />}
        onPress={() => router.push("/customer-form")}
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
