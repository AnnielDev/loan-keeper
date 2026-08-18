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

import { Icon } from "@/components/general/Icon";
import { ThemeToggle } from "@/components/general/ThemeToggle";
import { Select } from "@/components/ui/Select";
import type { ThemeColors } from "@/constants/theme";
import { useApiResource } from "@/hooks/useApiResource";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useFormField } from "@/hooks/useFormField";
import { ApiError } from "@/services/api";
import { getCurrencies } from "@/services/settings";
import { useAuthStore } from "@/store/auth";
import { formatMoneyInput, parseMoneyInput } from "@/utils/moneyInput";
import {
  email as emailRule,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  maxLength,
  required,
  strongPassword,
} from "@/utils/validation";

export default function SignUp() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const signUp = useAuthStore((state) => state.signUp);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const nameField = useFormField<string>(
    "",
    useMemo(() => [required(), maxLength(MAX_NAME_LENGTH)], []),
  );
  const emailField = useFormField<string>(
    "",
    useMemo(() => [required(), emailRule(), maxLength(MAX_EMAIL_LENGTH)], []),
  );
  const passwordField = useFormField<string>(
    "",
    useMemo(
      () => [required(), strongPassword(), maxLength(MAX_PASSWORD_LENGTH)],
      [],
    ),
  );
  const balanceField = useFormField<string>(
    "",
    useMemo(() => [required()], []),
  );
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: currenciesResponse,
    isLoading: isLoadingCurrencies,
    error: currenciesError,
    refetch: refetchCurrencies,
  } = useApiResource(getCurrencies);
  const currencies = currenciesResponse?.data ?? [];
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(
    null,
  );
  const [isCurrencyPickerOpen, setIsCurrencyPickerOpen] = useState(false);
  const currencyValue =
    selectedCurrency &&
    currencies.some((currency) => currency.code === selectedCurrency)
      ? selectedCurrency
      : (currencies[0]?.code ?? null);

  const translate = t as unknown as (key: string) => string;

  const canSubmit =
    nameField.isValid &&
    emailField.isValid &&
    passwordField.isValid &&
    balanceField.isValid &&
    !!currencyValue &&
    !isSubmitting;

  const handleSubmit = async () => {
    setError(null);

    if (!currencyValue) return;

    try {
      await signUp({
        email: emailField.value.trim(),
        password: passwordField.value,
        name: nameField.value.trim(),
        language: i18n.language,
        balance: parseMoneyInput(balanceField.value),
        currency: currencyValue,
      });
      router.replace("/sign-in");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("auth.errors.generic"),
      );
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
            <Text style={styles.title}>{t("auth.signUp.title")}</Text>

        <View style={styles.field}>
          <Text style={styles.label}>{t("auth.fields.name")}</Text>
          <TextInput
            style={styles.input}
            value={nameField.value}
            onChangeText={nameField.setValue}
            onBlur={nameField.onBlur}
            autoComplete="name"
            maxLength={MAX_NAME_LENGTH}
            placeholder="Juan Pérez"
            placeholderTextColor={colors.textSecondary}
          />
          {nameField.errorKey ? (
            <Text style={styles.fieldError}>
              {translate(nameField.errorKey)}
            </Text>
          ) : null}
        </View>

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
              autoComplete="password-new"
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

        <View style={styles.field}>
          <Text style={styles.label}>{t("auth.fields.balance")}</Text>
          <TextInput
            style={styles.input}
            value={balanceField.value}
            onChangeText={(text) =>
              balanceField.setValue(formatMoneyInput(text, i18n.language))
            }
            onBlur={balanceField.onBlur}
            keyboardType={
              Platform.OS === "ios" ? "numbers-and-punctuation" : "default"
            }
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
          />
          {balanceField.errorKey ? (
            <Text style={styles.fieldError}>
              {translate(balanceField.errorKey)}
            </Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t("auth.fields.currency")}</Text>
          {isLoadingCurrencies && (
            <ActivityIndicator color={colors.primary} />
          )}
          {currenciesError && !isLoadingCurrencies && (
            <TouchableOpacity onPress={refetchCurrencies}>
              <Text style={styles.error}>
                {t("settings.currency.errors.loadFailed")}
              </Text>
            </TouchableOpacity>
          )}
          {!isLoadingCurrencies && !currenciesError && currencyValue && (
            <Select
              options={currencies.map((currency) => ({
                label: `${currency.code}  ${currency.symbol}`,
                value: currency.code,
              }))}
              value={currencyValue}
              onChange={setSelectedCurrency}
              isOpen={isCurrencyPickerOpen}
              onOpen={() => setIsCurrencyPickerOpen(true)}
              onClose={() => setIsCurrencyPickerOpen(false)}
            />
          )}
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
            <Text style={styles.buttonLabel}>{t("auth.signUp.submit")}</Text>
          )}
        </TouchableOpacity>

        <Link href="/sign-in" asChild>
          <TouchableOpacity>
            <Text style={styles.link}>{t("auth.signUp.switchToSignIn")}</Text>
          </TouchableOpacity>
        </Link>

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
