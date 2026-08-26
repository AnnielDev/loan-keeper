import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { ThemeColors } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useFormField } from "@/hooks/useFormField";
import * as authService from "@/services/auth";
import { router } from "@/utils/navigation";
import { code as codeRule, required } from "@/utils/validation";

export default function VerifyResetCode() {
  const { t } = useTranslation();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const codeField = useFormField<string>(
    "",
    useMemo(() => [required(), codeRule()], []),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const translate = t as unknown as (key: string) => string;

  const canSubmit = codeField.isValid && !isSubmitting;

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await authService.verifyResetCode({
        email,
        code: codeField.value.trim(),
      });
      router.replace({ pathname: "/reset-password", params: { email } });
    } catch {
      setError(t("auth.errors.invalidOrExpiredCode"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setResent(false);
    setIsResending(true);
    try {
      await authService.forgotPassword({ email });
      setResent(true);
    } catch {
      setError(t("auth.errors.generic"));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <Text style={styles.title}>{t("auth.verifyCode.title")}</Text>
        <Text style={styles.subtitle}>
          {t("auth.verifyCode.subtitle", { email })}
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>{t("auth.fields.code")}</Text>
          <TextInput
            style={styles.codeInput}
            value={codeField.value}
            onChangeText={codeField.setValue}
            onBlur={codeField.onBlur}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor={colors.textSecondary}
          />
          {codeField.errorKey ? (
            <Text style={styles.fieldError}>
              {translate(codeField.errorKey)}
            </Text>
          ) : null}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {resent ? (
          <Text style={styles.success}>
            {t("auth.verifyCode.resendSuccess")}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.buttonLabel}>
              {t("auth.verifyCode.submit")}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} disabled={isResending}>
          <Text style={styles.link}>
            {isResending
              ? t("auth.verifyCode.resending")
              : t("auth.verifyCode.resend")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/forgot-password")}>
          <Text style={styles.link}>
            {t("auth.verifyCode.changeEmail")}
          </Text>
        </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardAvoiding: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
    },
    form: {
      padding: 24,
      gap: 12,
    },
    title: {
      fontSize: 22,
      fontWeight: "600",
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    field: {
      gap: 6,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    codeInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      fontSize: 24,
      fontWeight: "600",
      letterSpacing: 8,
      textAlign: "center",
      color: colors.text,
    },
    error: {
      color: colors.danger,
      fontSize: 14,
    },
    success: {
      color: colors.primary,
      fontSize: 14,
    },
    fieldError: {
      color: colors.danger,
      fontSize: 12,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonLabel: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: "600",
    },
    link: {
      color: colors.primary,
      fontSize: 14,
      textAlign: "center",
      marginTop: 4,
    },
  });
