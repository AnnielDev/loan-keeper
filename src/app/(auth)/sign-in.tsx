import { useEffect, useMemo, useState } from "react";
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

import { Icon } from "@/components/general/Icon";
import { ThemeToggle } from "@/components/general/ThemeToggle";
import type { ThemeColors } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useFormField } from "@/hooks/useFormField";
import { ApiError } from "@/services/api";
import { useAppLockStore } from "@/store/appLock";
import { useAuthStore } from "@/store/auth";
import { useNetworkStore } from "@/store/network";
import {
  forgetBiometricCredential,
  getRememberedBiometricEmail,
  readBiometricCredential,
  rememberBiometricCredential,
} from "@/utils/biometricCredentials";
import { router } from "@/utils/navigation";
import {
  email as emailRule,
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  maxLength,
  required,
} from "@/utils/validation";

export default function SignIn() {
  const { t } = useTranslation();
  const signIn = useAuthStore((state) => state.signIn);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const biometricEnabled = useAppLockStore((state) => state.biometricEnabled);
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const emailField = useFormField<string>(
    "",
    useMemo(() => [required(), emailRule(), maxLength(MAX_EMAIL_LENGTH)], []),
  );
  const passwordField = useFormField<string>(
    "",
    useMemo(() => [required(), maxLength(MAX_PASSWORD_LENGTH)], []),
  );
  const [showPassword, setShowPassword] = useState(false);
  const [rememberedEmail, setRememberedEmail] = useState<string | null>(null);
  const [isBiometricSigningIn, setIsBiometricSigningIn] = useState(false);
  const signedOutOffline = useNetworkStore((state) => state.signedOutOffline);
  const acknowledgeOfflineSignOut = useNetworkStore(
    (state) => state.acknowledgeOfflineSignOut,
  );
  const signedOutApiError = useNetworkStore((state) => state.signedOutApiError);
  const acknowledgeApiErrorSignOut = useNetworkStore(
    (state) => state.acknowledgeApiErrorSignOut,
  );
  const [error, setError] = useState<string | null>(
    signedOutOffline
      ? t("auth.errors.signedOutOffline")
      : signedOutApiError
        ? t("auth.errors.signedOutApiError")
        : null,
  );

  useEffect(() => {
    if (signedOutOffline) {
      acknowledgeOfflineSignOut();
    }
    if (signedOutApiError) {
      acknowledgeApiErrorSignOut();
    }
  }, [signedOutOffline, acknowledgeOfflineSignOut, signedOutApiError, acknowledgeApiErrorSignOut]);

  useEffect(() => {
    if (!biometricEnabled) {
      setRememberedEmail(null);
      return;
    }
    getRememberedBiometricEmail().then(setRememberedEmail);
  }, [biometricEnabled]);

  const translate = t as unknown as (key: string) => string;

  const canSubmit =
    emailField.isValid && passwordField.isValid && !isSubmitting;

  const handleSubmit = async () => {
    setError(null);
    const email = emailField.value.trim();
    const password = passwordField.value;
    try {
      await signIn({ email, password });
      if (biometricEnabled) {
        await rememberBiometricCredential(email, password, t("appLock.biometricPrompt"));
      }
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 400)) {
        // Avoid echoing backend messages that could distinguish "unknown
        // email" from "wrong password" and enable account enumeration.
        setError(t("auth.errors.invalidCredentials"));
      } else {
        setError(t("auth.errors.generic"));
      }
    }
  };

  const handleBiometricSignIn = async () => {
    if (!rememberedEmail) return;
    setError(null);
    setIsBiometricSigningIn(true);
    try {
      const password = await readBiometricCredential(t("appLock.biometricPrompt"));
      if (!password) return;
      await signIn({ email: rememberedEmail, password });
    } catch {
      // The remembered password is stale (e.g. changed elsewhere) — drop it
      // so the button disappears instead of retrying a doomed credential.
      await forgetBiometricCredential();
      setRememberedEmail(null);
      setError(t("auth.errors.biometricLoginFailed"));
    } finally {
      setIsBiometricSigningIn(false);
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
              maxLength={MAX_PASSWORD_LENGTH}
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

        <TouchableOpacity onPress={() => router.push("/forgot-password")}>
          <Text style={styles.forgotPasswordLink}>
            {t("auth.signIn.forgotPassword")}
          </Text>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.submitRow}>
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

          {rememberedEmail ? (
            <TouchableOpacity
              style={styles.biometricIconButton}
              onPress={handleBiometricSignIn}
              disabled={isBiometricSigningIn}
              accessibilityLabel={t("auth.signIn.useBiometricLogin")}
            >
              {isBiometricSigningIn ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Icon family="Ionicons" name="finger-print-outline" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity onPress={() => router.push("/sign-up")}>
          <Text style={styles.link}>{t("auth.signIn.switchToSignUp")}</Text>
        </TouchableOpacity>

        <View style={styles.themeToggle}>
          <ThemeToggle />
        </View>
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
    themeToggle: {
      alignItems: "center",
      marginTop: 20,
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
    forgotPasswordLink: {
      color: colors.primary,
      fontSize: 13,
      alignSelf: "flex-end",
    },
    submitRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 8,
    },
    button: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
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
    biometricIconButton: {
      width: 48,
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
  });
