import { useEffect, useMemo, useRef, useState } from "react";
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
import type { ThemeColors } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useFormField } from "@/hooks/useFormField";
import { ApiError } from "@/services/api";
import { useAppLockStore } from "@/store/appLock";
import { useAuthStore } from "@/store/auth";
import { authenticateWithBiometrics } from "@/utils/biometrics";
import { rememberBiometricCredential } from "@/utils/biometricCredentials";
import { MAX_PASSWORD_LENGTH, maxLength, required } from "@/utils/validation";

export default function AppLockScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const user = useAuthStore((state) => state.user);
  const signIn = useAuthStore((state) => state.signIn);
  const signOut = useAuthStore((state) => state.signOut);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const biometricEnabled = useAppLockStore((state) => state.biometricEnabled);
  const unlock = useAppLockStore((state) => state.unlock);

  const passwordField = useFormField<string>(
    "",
    useMemo(() => [required(), maxLength(MAX_PASSWORD_LENGTH)], []),
  );
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticatingBiometrics, setIsAuthenticatingBiometrics] = useState(false);
  const hasTriedBiometrics = useRef(false);
  const translate = t as unknown as (key: string) => string;

  const handleBiometricUnlock = async () => {
    setError(null);
    setIsAuthenticatingBiometrics(true);
    try {
      const success = await authenticateWithBiometrics(t("appLock.biometricPrompt"));
      if (success) {
        unlock();
      }
    } finally {
      setIsAuthenticatingBiometrics(false);
    }
  };

  useEffect(() => {
    if (biometricEnabled && !hasTriedBiometrics.current) {
      hasTriedBiometrics.current = true;
      handleBiometricUnlock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on mount when biometrics are enabled
  }, [biometricEnabled]);

  const canSubmit = passwordField.isValid && !isSubmitting;

  const handleSubmit = async () => {
    if (!user) return;
    setError(null);
    try {
      await signIn({ email: user.email, password: passwordField.value });
      if (biometricEnabled) {
        await rememberBiometricCredential(
          user.email,
          passwordField.value,
          t("appLock.biometricPrompt"),
        );
      }
      unlock();
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 400)) {
        setError(t("appLock.errors.invalidPassword"));
      } else {
        setError(t("auth.errors.generic"));
      }
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
            <View style={styles.iconWrap}>
              <Icon family="Ionicons" name="lock-closed-outline" size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>{t("appLock.title")}</Text>
            <Text style={styles.subtitle}>{user?.email}</Text>

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
                <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} hitSlop={8}>
                  <Icon
                    family="Ionicons"
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {passwordField.errorKey ? (
                <Text style={styles.fieldError}>{translate(passwordField.errorKey)}</Text>
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
                <Text style={styles.buttonLabel}>{t("appLock.unlock")}</Text>
              )}
            </TouchableOpacity>

            {biometricEnabled ? (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricUnlock}
                disabled={isAuthenticatingBiometrics}
              >
                {isAuthenticatingBiometrics ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <>
                    <Icon family="Ionicons" name="finger-print-outline" size={20} color={colors.primary} />
                    <Text style={styles.biometricLabel}>{t("appLock.useBiometrics")}</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity onPress={() => signOut()}>
              <Text style={styles.signOutLink}>{t("appLock.signOut")}</Text>
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
      alignItems: "stretch",
    },
    iconWrap: {
      alignSelf: "center",
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      marginBottom: 4,
    },
    title: {
      fontSize: 22,
      fontWeight: "600",
      textAlign: "center",
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      textAlign: "center",
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
    biometricButton: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
    },
    biometricLabel: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "600",
    },
    signOutLink: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: "center",
      marginTop: 8,
    },
  });
