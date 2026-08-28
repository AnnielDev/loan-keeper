import { useLocalSearchParams } from "expo-router";

import { router } from "@/utils/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/general/Icon";
import { PaymentSummaryCard } from "@/components/loans/PaymentSummaryCard";
import { ReceiptUploadField } from "@/components/loans/ReceiptUploadField";
import { DateField } from "@/components/ui/DateField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLoanDetail } from "@/hooks/useLoanDetail";
import { payInstallment } from "@/services/loans";
import type { PaymentMethod } from "@/types/loan";
import {
  formatNumericDate,
  parseCalendarDateForDisplay,
  toLocalDateString,
} from "@/utils/format";
import {
  formatMoneyInput,
  moneyToInputText,
  parseMoneyInput,
} from "@/utils/moneyInput";

export default function LoanPaymentFormScreen() {
  const { loanId, installmentId } = useLocalSearchParams<{
    loanId: string;
    installmentId: string;
  }>();
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const { data, isLoading, error, refetch } = useLoanDetail(loanId);

  const installment =
    data?.installments.find((item) => item._id === installmentId) ?? null;

  const [amount, setAmount] = useState("");
  const [hasPrefilled, setHasPrefilled] = useState(false);
  const [paymentDate, setPaymentDate] = useState(() => new Date());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [isMethodPickerOpen, setIsMethodPickerOpen] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (installment && !hasPrefilled) {
      setAmount(moneyToInputText(installment.amount, i18n.language));
      setHasPrefilled(true);
      const loanCollectionDate = parseCalendarDateForDisplay(data!.collectionDate);
      setPaymentDate((current) =>
        current < loanCollectionDate ? loanCollectionDate : current
      );
    }
  }, [installment, hasPrefilled, i18n.language, data]);

  const methodOptions: { label: string; value: PaymentMethod }[] = [
    { label: t("paymentForm.methods.cash"), value: "cash" },
    { label: t("paymentForm.methods.bank_transfer"), value: "bank_transfer" },
    { label: t("paymentForm.methods.card"), value: "card" },
    { label: t("paymentForm.methods.other"), value: "other" },
  ];

  const parsedAmount = parseMoneyInput(amount);
  const canSubmit = !!installment && parsedAmount > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!installment || !data) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await payInstallment(loanId, installmentId, {
        amount: parsedAmount,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        receiptUrl: receiptUrl ?? undefined,
        notes: notes.trim() || undefined,
        paymentDate: toLocalDateString(paymentDate),
      });
      router.replace({
        pathname: "/payment-detail",
        params: { loanId, installmentId },
      });
    } catch {
      setIsConfirmVisible(false);
      setSubmitError(t("paymentForm.errors.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if ((error && !data) || !data || !installment) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          {t("loanDetail.errors.loadFailed")}
        </Text>
        <Pressable
          onPress={refetch}
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.retryLabel, { color: colors.onPrimary }]}>
            {t("loanDetail.retry")}
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Icon
            family="Ionicons"
            name="chevron-back"
            size={26}
            color={colors.text}
          />
        </Pressable>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>
          {t("paymentForm.title")}
        </Text>
        <View style={styles.topBarSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <PaymentSummaryCard
            loanCode={data!.code}
            customerName={data!.customerName}
            amount={installment.amount}
          />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("paymentForm.sectionTitle")}
          </Text>

          <TextField
            label={t("paymentForm.fields.amount")}
            icon={
              <Icon
                family="Ionicons"
                name="cash-outline"
                size={18}
                color={colors.textSecondary}
              />
            }
            value={amount}
            onChangeText={(text) =>
              setAmount(formatMoneyInput(text, i18n.language))
            }
            keyboardType="decimal-pad"
          />

          <DateField
            label={t("paymentForm.fields.date")}
            value={paymentDate}
            displayValue={formatNumericDate(paymentDate, i18n.language)}
            onChange={setPaymentDate}
            minimumDate={parseCalendarDateForDisplay(data!.collectionDate)}
            doneLabel={t("loanForm.datePickerDone")}
          />

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t("paymentForm.fields.method")}
            </Text>
            <Select
              options={methodOptions}
              value={paymentMethod}
              onChange={setPaymentMethod}
              isOpen={isMethodPickerOpen}
              onOpen={() => setIsMethodPickerOpen(true)}
              onClose={() => setIsMethodPickerOpen(false)}
            />
          </View>

          <TextField
            label={t("paymentForm.fields.reference")}
            icon={
              <Icon
                family="Ionicons"
                name="pricetag-outline"
                size={18}
                color={colors.textSecondary}
              />
            }
            value={referenceNumber}
            onChangeText={setReferenceNumber}
            placeholder={t("paymentForm.placeholders.reference")}
          />

          <ReceiptUploadField value={receiptUrl} onChange={setReceiptUrl} />

          <TextField
            label={t("paymentForm.fields.notes")}
            value={notes}
            onChangeText={setNotes}
            placeholder={t("paymentForm.placeholders.notes")}
            multiline
          />

          {submitError ? (
            <Text style={[styles.submitError, { color: colors.danger }]}>
              {submitError}
            </Text>
          ) : null}

          <PrimaryButton
            label={t("paymentForm.submit")}
            icon={
              <Icon
                family="Ionicons"
                name="checkmark-circle-outline"
                size={20}
                color={colors.onPrimary}
              />
            }
            onPress={() => setIsConfirmVisible(true)}
            disabled={!canSubmit}
          />

          <Pressable onPress={() => router.back()} style={styles.cancelButton}>
            <Text style={[styles.cancelLabel, { color: colors.primary }]}>
              {t("paymentForm.cancel")}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={isConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !isSubmitting && setIsConfirmVisible(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => !isSubmitting && setIsConfirmVisible(false)}
        >
          <Pressable
            style={[styles.dialog, { backgroundColor: colors.card }]}
            onPress={() => {}}
          >
            <View
              style={[
                styles.dialogIconCircle,
                { backgroundColor: colors.warningSurface },
              ]}
            >
              <Icon
                family="Ionicons"
                name="alert-circle-outline"
                size={26}
                color={colors.warning}
              />
            </View>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>
              {t("paymentForm.confirmDialog.title")}
            </Text>
            <Text
              style={[styles.dialogMessage, { color: colors.textSecondary }]}
            >
              {t("paymentForm.confirmDialog.message")}
            </Text>
            <View style={styles.dialogActions}>
              <View style={styles.dialogButton}>
                <SecondaryButton
                  label={t("paymentForm.confirmDialog.cancel")}
                  onPress={() => setIsConfirmVisible(false)}
                  disabled={isSubmitting}
                />
              </View>
              <View style={styles.dialogButton}>
                <PrimaryButton
                  label={t("paymentForm.confirmDialog.confirm")}
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
  topBarTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  topBarSpacer: {
    width: 26,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: -4,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  submitError: {
    fontSize: 13,
    textAlign: "center",
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 4,
  },
  cancelLabel: {
    fontSize: 15,
    fontWeight: "700",
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
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  dialogIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  dialogMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 14,
  },
  dialogActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  dialogButton: {
    flex: 1,
  },
});
