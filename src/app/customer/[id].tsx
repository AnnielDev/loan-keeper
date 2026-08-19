import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/general/Icon";
import { CustomerBalanceCard } from "@/components/customers/CustomerBalanceCard";
import { CustomerContactCard } from "@/components/customers/CustomerContactCard";
import { CustomerProfileHeader } from "@/components/customers/CustomerProfileHeader";
import { LoanCompactRow } from "@/components/loans/LoanCompactRow";
import { LoanDetailCard } from "@/components/loans/LoanDetailCard";
import { CircleIconButton } from "@/components/ui/CircleIconButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useCustomerDetail } from "@/hooks/useCustomerDetail";
import type { CustomerLoanSummary } from "@/types/customer";
import { useAuthStore } from "@/store/auth";
import { formatCurrency } from "@/utils/format";

const LOAN_STATUS_PRIORITY: Record<CustomerLoanSummary["status"], number> = {
  overdue: 0,
  active: 1,
  paid: 2,
};

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const currency = useAuthStore((state) => state.user?.currency ?? "USD");
  const { data, isLoading, isRefreshing, error, refetch } = useCustomerDetail(id);

  const handleRegisterPayment = (loan: CustomerLoanSummary) => {
    if (!loan.nextInstallmentId) return;
    router.push({
      pathname: "/loan-payment-form",
      params: { loanId: loan._id, installmentId: loan.nextInstallmentId },
    });
  };

  const handleMessage = () => {
    if (data?.phone) Linking.openURL(`sms:${data.phone}`);
  };

  const handleOpenMap = () => {
    if (data?.address) Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(data.address)}`);
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
          {t("customerDetail.errors.loadFailed")}
        </Text>
        <Pressable onPress={refetch} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
          <Text style={[styles.retryLabel, { color: colors.onPrimary }]}>{t("customerDetail.retry")}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!data) return null;

  const activeLoans = [...data.loans]
    .filter((loan) => loan.status !== "paid")
    .sort((a, b) => LOAN_STATUS_PRIORITY[a.status] - LOAN_STATUS_PRIORITY[b.status]);
  const [featuredLoan, ...restLoans] = activeLoans;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Icon family="Ionicons" name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <CircleIconButton
          icon={<Icon family="Ionicons" name="create-outline" size={20} color={colors.primary} />}
          onPress={() => router.push({ pathname: "/customer-form", params: { id: data._id } })}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        <CustomerProfileHeader
          avatarUrl={data.avatarUrl}
          fullName={data.fullName}
          documentId={data.documentId}
        />

        <CustomerBalanceCard pendingBalance={data.pendingBalance} riskLevel={data.riskLevel} />

        <View style={styles.statsRow}>
          <StatCard
            icon={<Icon family="Ionicons" name="swap-vertical" size={18} color={colors.onPrimary} />}
            label={t("customerDetail.totalLoaned")}
            value={formatCurrency(data.totalLoaned, currency, i18n.language)}
            style={styles.statCard}
          />
          <StatCard
            icon={<Icon family="Ionicons" name="cash-outline" size={18} color={colors.onPrimary} />}
            label={t("customerDetail.totalCollected")}
            value={formatCurrency(data.totalCollected, currency, i18n.language)}
            tone="success"
            style={styles.statCard}
          />
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.flex}>
            <PrimaryButton
              label={t("customerDetail.newLoan")}
              icon={<Icon family="Ionicons" name="add-circle-outline" size={20} color={colors.onPrimary} />}
              onPress={() => router.push({ pathname: "/loan-form", params: { customerId: data._id } })}
            />
          </View>
          <View style={styles.flex}>
            <SecondaryButton
              label={t("customerDetail.viewHistory")}
              icon={<Icon family="Ionicons" name="document-text-outline" size={20} color={colors.text} />}
              onPress={() => router.push({ pathname: "/customer-history", params: { customerId: data._id } })}
            />
          </View>
        </View>

        <CustomerContactCard
          phone={data.phone}
          address={data.address}
          createdAt={data.createdAt}
          onMessage={handleMessage}
          onOpenMap={handleOpenMap}
        />

        <SectionHeader
          title={t("customerDetail.loans.title")}
          action={{ label: t("customerDetail.loans.viewAll"), onPress: () => router.push("/loans") }}
        />

        {activeLoans.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t("customerDetail.loans.empty")}
          </Text>
        ) : (
          <>
            {featuredLoan ? (
              <LoanDetailCard
                loan={featuredLoan}
                onPress={() => router.push(`/loan/${featuredLoan._id}`)}
                onRegisterPayment={() => handleRegisterPayment(featuredLoan)}
              />
            ) : null}
            {restLoans.map((loan) => (
              <LoanCompactRow
                key={loan._id}
                loan={loan}
                onPress={() => router.push(`/loan/${loan._id}`)}
              />
            ))}
          </>
        )}
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  content: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  flex: {
    flex: 1,
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
