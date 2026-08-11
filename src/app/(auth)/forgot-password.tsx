import { Link, useRouter } from "expo-router";
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
import { ApiError } from "@/services/api";
import {
  email as emailRule,
  MAX_EMAIL_LENGTH,
  maxLength,
  required,
} from "@/utils/validation";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const emailField = useFormField<string>(
    "",
    useMemo(() => [required(), emailRule(), maxLength(MAX_EMAIL_LENGTH)], []),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = t as unknown as (key: string) => string;

  const canSubmit = emailField.isValid && !isSubmitting;

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const email = emailField.value.trim();
      await authService.forgotPassword({ email });
      router.push({ pathname: "/verify-reset-code", params: { email } });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("auth.errors.generic"),
      );
    } finally {
      setIsSubmitting(false);
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
            <Text style={styles.title}>{t("auth.forgotPassword.title")}</Text>
        <Text style={styles.subtitle}>
          {t("auth.forgotPassword.subtitle")}
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>{t("auth.fields.email")}</Text>
          <TextInput
            style={styles.input}
            value={emailField.value}
            onChangeText={emailField.setValue}
            onBlur={emailField.onBlur}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            maxLength={MAX_EMAIL_LENGTH}
            placeholder="you@example.com"
            placeholderTextColor={colors.textSecondary}
          />
          {emailField.errorKey ? (
            <Text style={styles.fieldError}>
              {translate(emailField.errorKey)}
            </Text>
          ) : null}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.buttonLabel}>
              {t("auth.forgotPassword.submit")}
            </Text>
          )}
        </TouchableOpacity>

        <Link href="/sign-in" asChild>
          <TouchableOpacity>
            <Text style={styles.link}>
              {t("auth.forgotPassword.backToSignIn")}
            </Text>
          </TouchableOpacity>
        </Link>
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
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      fontSize: 16,
      color: colors.text,
    },
    error: {
      color: colors.danger,
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
      marginTop: 12,
    },
  });
