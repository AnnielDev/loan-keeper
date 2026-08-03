import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/general/Icon";
import type { ThemeColors } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useFormField } from "@/hooks/useFormField";
import { ApiError } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { required } from "@/utils/validation";

export default function SignIn() {
  const { t } = useTranslation();
  const signIn = useAuthStore((state) => state.signIn);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const emailField = useFormField<string>(
    "",
    useMemo(() => [required()], []),
  );
  const passwordField = useFormField<string>(
    "",
    useMemo(() => [required()], []),
  );
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = t as unknown as (key: string) => string;

  const canSubmit =
    emailField.isValid && passwordField.isValid && !isSubmitting;

  const handleSubmit = async () => {
    setError(null);
    try {
      await signIn({
        email: emailField.value.trim(),
        password: passwordField.value,
      });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("auth.errors.generic"),
      );
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>{t("auth.signIn.title")}</Text>

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
            placeholder="you@example.com"
            placeholderTextColor={colors.textSecondary}
          />
          {emailField.errorKey ? (
            <Text style={styles.fieldError}>
              {translate(emailField.errorKey)}
            </Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t("auth.fields.password")}</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              value={passwordField.value}
              onChangeText={passwordField.setValue}
              onBlur={passwordField.onBlur}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={8}
            >
              <Icon
                family="Ionicons"
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {passwordField.errorKey ? (
            <Text style={styles.fieldError}>
              {translate(passwordField.errorKey)}
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
            <Text style={styles.buttonLabel}>{t("auth.signIn.submit")}</Text>
          )}
        </TouchableOpacity>

        <Link href="/sign-up" asChild>
          <TouchableOpacity>
            <Text style={styles.link}>{t("auth.signIn.switchToSignUp")}</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    form: {
      padding: 24,
      gap: 12,
    },
    title: {
      fontSize: 22,
      fontWeight: "600",
      marginBottom: 12,
      color: colors.text,
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
    passwordWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
    },
    passwordInput: {
      flex: 1,
      paddingVertical: 10,
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
