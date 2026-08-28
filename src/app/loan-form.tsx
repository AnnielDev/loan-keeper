import { useFocusEffect, useLocalSearchParams } from "expo-router";

import { router } from "@/utils/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/general/Icon";
import { InstallmentScheduleList } from "@/components/loans/InstallmentScheduleList";
import { LoanEstimateSummary } from "@/components/loans/LoanEstimateSummary";
import { Card } from "@/components/ui/Card";
import { DateField } from "@/components/ui/DateField";
import { FormHeader } from "@/components/ui/FormHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getCustomers } from "@/services/customers";
import { createLoan } from "@/services/loans";
import type { CustomerSummary } from "@/types/customer";
import type { InterestType, PaymentFrequency } from "@/types/loan";
import { formatNumericDate, toLocalDateString } from "@/utils/format";
import { calculateLoan } from "@/utils/loanCalculator";
import { formatMoneyInput, parseMoneyInput } from "@/utils/moneyInput";

const DEFAULT_INSTALLMENTS_COUNT = "12";
const DEFAULT_INTEREST_RATE_CENTS = "500";

export default function LoanFormScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const { customerId: preselectedCustomerId } = useLocalSearchParams<{
    customerId?: string;
  }>();

  const [customers, setCustomers] = useState<CustomerSummary[] | null>(null);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [customersError, setCustomersError] = useState(false);
  const [customerId, setCustomerId] = useState(preselectedCustomerId ?? "");
  const [isCustomerPickerOpen, setIsCustomerPickerOpen] = useState(false);

  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState(() =>
    formatMoneyInput(DEFAULT_INTEREST_RATE_CENTS, i18n.language),
  );
  const [interestType, setInterestType] = useState<InterestType>("simple");
  const [frequency, setFrequency] = useState<PaymentFrequency>("monthly");
  const [isFrequencyPickerOpen, setIsFrequencyPickerOpen] = useState(false);
  const [installmentsCount, setInstallmentsCount] = useState(
    DEFAULT_INSTALLMENTS_COUNT,
  );
  const [startDate, setStartDate] = useState(() => new Date());
  const [collectionDate, setCollectionDate] = useState(() => new Date());
  const [isLegacy, setIsLegacy] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const hasLoadedCustomersRef = useRef(false);

  // Silent refresh on refocus so returning from the "add a customer" empty
  // state (or the customer-form modal) picks up the newly created customer.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (!hasLoadedCustomersRef.current) setIsLoadingCustomers(true);

      (async () => {
        try {
          const result = await getCustomers({});
          if (cancelled) return;
          setCustomers(result);
          setCustomersError(false);
          setCustomerId((current) =>
            current && result.some((customer) => customer._id === current)
              ? current
              : (result[0]?._id ?? ""),
          );
        } catch {
          if (!cancelled) setCustomersError(true);
        } finally {
          if (!cancelled) {
            hasLoadedCustomersRef.current = true;
            setIsLoadingCustomers(false);
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const customerOptions = useMemo(
    () =>
      (customers ?? []).map((customer) => ({
        label: customer.fullName,
        value: customer._id,
      })),
    [customers],
  );

  const frequencyOptions: { label: string; value: PaymentFrequency }[] = [
    { label: t("loanForm.frequency.monthly"), value: "monthly" },
    { label: t("loanForm.frequency.every_2_months"), value: "every_2_months" },
    { label: t("loanForm.frequency.every_3_months"), value: "every_3_months" },
  ];

  const interestTypeOptions: { label: string; value: InterestType }[] = [
    { label: t("loanForm.interestType.simple"), value: "simple" },
    { label: t("loanForm.interestType.compound"), value: "compound" },
  ];

  const loanOriginOptions: { label: string; value: "new" | "legacy" }[] = [
    { label: t("loanForm.loanOrigin.new"), value: "new" },
    { label: t("loanForm.loanOrigin.legacy"), value: "legacy" },
  ];

  const parsedPrincipal = parseMoneyInput(principal);
  const parsedInterestRate = parseMoneyInput(interestRate);
  const parsedInstallmentsCount = Math.max(
    Number(installmentsCount.replace(/[^0-9]/g, "")) || 0,
    0,
  );

  const calculation = useMemo(
    () =>
      calculateLoan({
        principal: parsedPrincipal,
        interestRate: parsedInterestRate,
        interestType,
        installmentsCount: parsedInstallmentsCount,
        frequency,
        startDate,
        collectionDate,
      }),
    [
      parsedPrincipal,
      parsedInterestRate,
      interestType,
      parsedInstallmentsCount,
      frequency,
      startDate,
      collectionDate,
    ],
  );

  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
    setCollectionDate((current) => (current < date ? date : current));
  };

  const handleLoanOriginChange = (value: "new" | "legacy") => {
    setIsLegacy(value === "legacy");
  };

  const canSubmit =
    !!customerId &&
    parsedPrincipal > 0 &&
    parsedInstallmentsCount > 0 &&
    !isSubmitting;

  const handleSubmit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await createLoan({
        customerId,
        type: "personal",
        principal: parsedPrincipal,
        interestRate: parsedInterestRate,
        interestType,
        frequency,
        installmentsCount: parsedInstallmentsCount,
        startDate: toLocalDateString(startDate),
        collectionDate: toLocalDateString(collectionDate),
        isLegacy,
      });
      router.back();
    } catch {
      setSubmitError(t("loanForm.errors.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Icon family="Ionicons" name="close" size={24} color={colors.text} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <FormHeader
            icon={
              <Icon
                family="Ionicons"
                name="card"
                size={22}
                color={colors.onPrimary}
              />
            }
            title={t("loanForm.title")}
            subtitle={t("loanForm.subtitle")}
          />

          {isLoadingCustomers ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={styles.customersSpinner}
            />
          ) : customersError ? (
            <Text style={[styles.emptyText, { color: colors.danger }]}>
              {t("loanForm.errors.customersLoadFailed")}
            </Text>
          ) : customerOptions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t("loanForm.noCustomers")}
              </Text>
            </Card>
          ) : (
            <>
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  {t("loanForm.fields.customer")}
                </Text>
                <Select
                  options={customerOptions}
                  value={customerId}
                  onChange={setCustomerId}
                  isOpen={isCustomerPickerOpen}
                  onOpen={() => setIsCustomerPickerOpen(true)}
                  onClose={() => setIsCustomerPickerOpen(false)}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  {t("loanForm.fields.loanOrigin")}
                </Text>
                <SegmentedToggle
                  options={loanOriginOptions}
                  value={isLegacy ? "legacy" : "new"}
                  onChange={handleLoanOriginChange}
                />
                {isLegacy ? (
                  <Text
                    style={[styles.originHint, { color: colors.textSecondary }]}
                  >
                    {t("loanForm.loanOrigin.legacyHint")}
                  </Text>
                ) : null}
              </View>

              <View style={styles.row}>
                <View style={styles.flex}>
                  <TextField
                    label={t("loanForm.fields.principal")}
                    icon={
                      <Icon
                        family="Ionicons"
                        name="cash-outline"
                        size={18}
                        color={colors.textSecondary}
                      />
                    }
                    value={principal}
                    onChangeText={(text) =>
                      setPrincipal(formatMoneyInput(text, i18n.language))
                    }
                    placeholder={t("loanForm.placeholders.principal")}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.flex}>
                  <TextField
                    label={t("loanForm.fields.interestRate")}
                    icon={
                      <Icon
                        family="Ionicons"
                        name="trending-up-outline"
                        size={18}
                        color={colors.textSecondary}
                      />
                    }
                    value={interestRate}
                    onChangeText={(text) =>
                      setInterestRate(formatMoneyInput(text, i18n.language))
                    }
                    placeholder={t("loanForm.placeholders.interestRate")}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  {t("loanForm.fields.interestType")}
                </Text>
                <SegmentedToggle
                  options={interestTypeOptions}
                  value={interestType}
                  onChange={setInterestType}
                />
                <Text style={[styles.originHint, { color: colors.textSecondary }]}>
                  {t(`loanForm.interestType.${interestType}Hint`)}
                </Text>
              </View>

              <View style={styles.row}>
                <View style={[styles.flex, { gap: 6 }]}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    {t("loanForm.fields.frequency")}
                  </Text>
                  <Select
                    options={frequencyOptions}
                    value={frequency}
                    onChange={setFrequency}
                    isOpen={isFrequencyPickerOpen}
                    onOpen={() => setIsFrequencyPickerOpen(true)}
                    onClose={() => setIsFrequencyPickerOpen(false)}
                  />
                </View>
                <View style={styles.flex}>
                  <TextField
                    label={t("loanForm.fields.installmentsCount")}
                    icon={
                      <Icon
                        family="Ionicons"
                        name="repeat-outline"
                        size={18}
                        color={colors.textSecondary}
                      />
                    }
                    value={installmentsCount}
                    onChangeText={setInstallmentsCount}
                    placeholder={t("loanForm.placeholders.installmentsCount")}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.flex}>
                  <DateField
                    label={t("loanForm.fields.startDate")}
                    value={startDate}
                    displayValue={formatNumericDate(startDate, i18n.language)}
                    onChange={handleStartDateChange}
                    doneLabel={t("loanForm.datePickerDone")}
                  />
                </View>
                <View style={styles.flex}>
                  <DateField
                    label={t("loanForm.fields.collectionDate")}
                    value={collectionDate}
                    displayValue={formatNumericDate(
                      collectionDate,
                      i18n.language,
                    )}
                    onChange={setCollectionDate}
                    minimumDate={startDate}
                    doneLabel={t("loanForm.datePickerDone")}
                  />
                </View>
              </View>

              <LoanEstimateSummary calculation={calculation} />

              <Pressable
                onPress={() => setShowSchedule((prev) => !prev)}
                style={styles.scheduleToggle}
              >
                <Icon
                  family="Ionicons"
                  name="calendar-outline"
                  size={16}
                  color={colors.primary}
                />
                <Text
                  style={[
                    styles.scheduleToggleLabel,
                    { color: colors.primary },
                  ]}
                >
                  {t(
                    showSchedule
                      ? "loanForm.hideSchedule"
                      : "loanForm.viewSchedule",
                  )}
                </Text>
              </Pressable>

              {showSchedule ? (
                <InstallmentScheduleList
                  installments={calculation.installments}
                />
              ) : null}

              {submitError ? (
                <Text style={[styles.submitError, { color: colors.danger }]}>
                  {submitError}
                </Text>
              ) : null}

              <PrimaryButton
                label={t("loanForm.submit")}
                icon={
                  <Icon
                    family="Ionicons"
                    name="arrow-forward"
                    size={20}
                    color={colors.onPrimary}
                  />
                }
                onPress={handleSubmit}
                isLoading={isSubmitting}
                disabled={!canSubmit}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  content: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  customersSpinner: {
    marginTop: 24,
  },
  emptyCard: {
    gap: 14,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  originHint: {
    fontSize: 12,
    lineHeight: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scheduleToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: -8,
  },
  scheduleToggleLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  submitError: {
    fontSize: 13,
    textAlign: "center",
  },
});
