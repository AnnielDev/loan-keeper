import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/general/Icon";
import { InstallmentTimelineRow } from "@/components/loans/InstallmentTimelineRow";
import { LoanOverviewCard } from "@/components/loans/LoanOverviewCard";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLoanDetail } from "@/hooks/useLoanDetail";

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { data, isLoading, isRefreshing, error, refetch } = useLoanDetail(id);

  const handleRegisterPayment = () => {
    if (!data?.nextInstallmentId) return;
    router.push({
      pathname: "/loan-payment-form",
      params: { loanId: data._id, installmentId: data.nextInstallmentId },
    });
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
          {t("loanDetail.errors.loadFailed")}
        </Text>
        <Pressable onPress={refetch} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
          <Text style={[styles.retryLabel, { color: colors.onPrimary }]}>{t("loanDetail.retry")}</Text>
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
        <LoanOverviewCard loan={data} onRegisterPayment={handleRegisterPayment} />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("loanDetail.scheduleTitle")}</Text>

        <View style={styles.timeline}>
          {data.installments.map((installment) => (
            <InstallmentTimelineRow
              key={installment._id}
              installment={installment}
              total={data.installments.length}
              onAction={() =>
                installment.status === "paid"
                  ? router.push({
                      pathname: "/payment-detail",
                      params: { loanId: data._id, installmentId: installment._id },
                    })
                  : router.push({
                      pathname: "/loan-payment-form",
                      params: { loanId: data._id, installmentId: installment._id },
                    })
              }
            />
          ))}
        </View>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  timeline: {
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
