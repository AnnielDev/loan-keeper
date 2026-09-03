import { useEffect, useMemo, useState } from "react";
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
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BiometricToggle } from "@/components/general/BiometricToggle";
import { Icon } from "@/components/general/Icon";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import type { ColorScheme, ThemeColors } from "@/constants/theme";
import { useApiResource } from "@/hooks/useApiResource";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useFormField } from "@/hooks/useFormField";
import { setAppLanguage } from "@/i18n";
import { ApiError } from "@/services/api";
import { deleteAccount } from "@/services/auth";
import {
  getCurrencies,
  getLanguages,
  updateCurrency,
  updateLanguage,
  updateName,
} from "@/services/settings";
import { useApiAlertStore } from "@/store/apiAlert";
import { useAppLockStore } from "@/store/appLock";
import { useAuthStore } from "@/store/auth";
import { authenticateWithBiometrics, isBiometricAvailable } from "@/utils/biometrics";
import {
  forgetBiometricCredential,
  getRememberedBiometricEmail,
  rememberBiometricCredential,
} from "@/utils/biometricCredentials";
import { formatCurrency } from "@/utils/format";
import { router } from "@/utils/navigation";
import { MAX_NAME_LENGTH, MAX_PASSWORD_LENGTH, required, maxLength } from "@/utils/validation";

const appearanceOptions: { scheme: ColorScheme; icon: "sunny" | "moon" }[] = [
  { scheme: "light", icon: "sunny" },
  { scheme: "dark", icon: "moon" },
];

export default function SettingsTabScreen() {
  const { t, i18n } = useTranslation();
  const translate = t as unknown as (key: string) => string;
  const user = useAuthStore((state) => state.user);
  const signIn = useAuthStore((state) => state.signIn);
  const signOut = useAuthStore((state) => state.signOut);
  const forceSignOut = useAuthStore((state) => state.forceSignOut);
  const updateUser = useAuthStore((state) => state.updateUser);
  const showApiAlert = useApiAlertStore((state) => state.showApiAlert);
  const { colors, scheme, setMode } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isLanguagePickerOpen, setIsLanguagePickerOpen] = useState(false);
  const [isCurrencyPickerOpen, setIsCurrencyPickerOpen] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const nameField = useFormField<string>(
    user?.name ?? "",
    useMemo(() => [required(), maxLength(MAX_NAME_LENGTH)], []),
  );

  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isSignOutConfirmVisible, setIsSignOutConfirmVisible] = useState(false);

  const biometricEnabled = useAppLockStore((state) => state.biometricEnabled);
  const setBiometricEnabled = useAppLockStore((state) => state.setBiometricEnabled);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isTogglingBiometric, setIsTogglingBiometric] = useState(false);
  const [hasRememberedCredential, setHasRememberedCredential] = useState(false);
  const [isBiometricPasswordConfirmVisible, setIsBiometricPasswordConfirmVisible] = useState(false);
  const [isConfirmingBiometricPassword, setIsConfirmingBiometricPassword] = useState(false);
  const [biometricPasswordError, setBiometricPasswordError] = useState<string | null>(null);
  const biometricPasswordField = useFormField<string>(
    "",
    useMemo(() => [required(), maxLength(MAX_PASSWORD_LENGTH)], []),
  );

  useEffect(() => {
    isBiometricAvailable().then(setIsBiometricSupported);
  }, []);

  const planStatusLabel = useMemo(() => {
    if (!user) return "";
    if (user.subscriptionStatus === "active") {
      return t("settings.account.planStatus.active");
    }
    if (user.subscriptionStatus === "trialing") {
      const daysLeft = Math.max(
        0,
        Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
      );
      return daysLeft > 0
        ? t("settings.account.planStatus.trialing", { count: daysLeft })
        : t("settings.account.planStatus.trialEnded");
    }
    return t("settings.account.planStatus.expired");
  }, [user, t]);

  useEffect(() => {
    if (!biometricEnabled) {
      setHasRememberedCredential(false);
      return;
    }
    getRememberedBiometricEmail().then((email) => setHasRememberedCredential(!!email));
  }, [biometricEnabled]);

  const handleToggleBiometric = async (nextEnabled: boolean) => {
    if (!nextEnabled) {
      setBiometricEnabled(false);
      await forgetBiometricCredential();
      return;
    }
    setIsTogglingBiometric(true);
    try {
      const success = await authenticateWithBiometrics(t("appLock.biometricPrompt"));
      if (success) {
        setBiometricEnabled(true);
        // Enabling the toggle alone can't remember a credential — we've
        // never seen the password. Ask for it once now so the fingerprint
        // button on the sign-in screen works immediately, instead of only
        // after the next manual password login.
        biometricPasswordField.setValue("");
        setBiometricPasswordError(null);
        setIsBiometricPasswordConfirmVisible(true);
      }
    } finally {
      setIsTogglingBiometric(false);
    }
  };

  const handleConfirmBiometricPassword = async () => {
    if (!user) return;
    setIsConfirmingBiometricPassword(true);
    setBiometricPasswordError(null);
    try {
      await signIn({ email: user.email, password: biometricPasswordField.value });
      await rememberBiometricCredential(
        user.email,
        biometricPasswordField.value,
        t("appLock.biometricPrompt"),
      );
      setHasRememberedCredential(true);
      setIsBiometricPasswordConfirmVisible(false);
    } catch (err) {
      setBiometricPasswordError(
        err instanceof ApiError && (err.status === 401 || err.status === 400)
          ? t("auth.errors.invalidCredentials")
          : t("auth.errors.generic"),
      );
    } finally {
      setIsConfirmingBiometricPassword(false);
    }
  };

  const handleCancelBiometricPasswordConfirm = () => {
    setIsBiometricPasswordConfirmVisible(false);
    // Without a remembered credential the toggle would be on with no way to
    // actually use it — turn it back off instead of leaving it in that state.
    setBiometricEnabled(false);
  };

  const {
    data: languagesResponse,
    isLoading: isLoadingLanguages,
    error: languagesError,
    refetch: refetchLanguages,
  } = useApiResource(getLanguages);
  const languages = languagesResponse?.data ?? [];

  const {
    data: currenciesResponse,
    isLoading: isLoadingCurrencies,
    error: currenciesError,
    refetch: refetchCurrencies,
  } = useApiResource(getCurrencies);
  const currencies = currenciesResponse?.data ?? [];
  const currentCurrency = useAuthStore((state) => state.user?.currency);
  const balance = useAuthStore((state) => state.user?.balance);

  const handleSelectLanguage = async (code: string) => {
    if (code === i18n.language) return;
    await setAppLanguage(code);
    try {
      const { data } = await updateLanguage({ language: code });
      updateUser(data);
    } catch {
      // Best effort: the language already switched locally even if the sync fails.
    }
  };

  const handleSelectCurrency = async (code: string) => {
    if (code === currentCurrency) return;
    try {
      const { data } = await updateCurrency({ currency: code });
      updateUser(data);
    } catch {
      // Best effort: retry happens on the next selection attempt.
    }
  };

  const handleStartEditName = () => {
    nameField.setValue(user?.name ?? "");
    setIsEditingName(true);
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
  };

  const handleSaveName = async () => {
    nameField.onBlur();
    if (!nameField.isValid) return;

    setIsSavingName(true);
    try {
      const { data } = await updateName({ name: nameField.value.trim() });
      updateUser(data);
      setIsEditingName(false);
    } catch (err) {
      showApiAlert(
        t("settings.account.nameErrorTitle"),
        err instanceof ApiError ? err.message : t("settings.account.nameError"),
      );
    } finally {
      setIsSavingName(false);
    }
  };

  const handleConfirmSignOut = () => {
    setIsSignOutConfirmVisible(false);
    signOut();
  };

  const handleConfirmDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await deleteAccount();
      setIsDeleteConfirmVisible(false);
      forceSignOut();
    } catch (err) {
      setIsDeletingAccount(false);
      showApiAlert(
        t("settings.account.deleteAccount.errorTitle"),
        err instanceof ApiError ? err.message : t("settings.account.deleteAccount.errorMessage"),
      );
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <Text style={styles.title}>{t("tabs.settings")}</Text>

        <View style={styles.appearanceRow}>
          {appearanceOptions.map((option) => {
            const isActive = scheme === option.scheme;
            return (
              <Pressable
                key={option.scheme}
                onPress={() => setMode(option.scheme)}
                style={[
                  styles.appearanceCard,
                  isActive && styles.appearanceCardActive,
                ]}
              >
                {isActive && (
                  <View style={styles.appearanceCheck}>
                    <Icon
                      family="Ionicons"
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                )}
                <View
                  style={[
                    styles.appearanceIconWrap,
                    isActive && styles.appearanceIconWrapActive,
                  ]}
                >
                  <Icon
                    family="Ionicons"
                    name={option.icon}
                    size={26}
                    color={option.scheme === "light" ? "#F59E0B" : "#818CF8"}
                  />
                </View>
                <Text
                  style={[
                    styles.appearanceLabel,
                    isActive && styles.appearanceLabelActive,
                  ]}
                >
                  {t(`settings.theme.${option.scheme}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.selectRow}>
          <View style={styles.selectColumn}>
            {isLoadingLanguages && (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={styles.languageLoading}
              />
            )}
            {languagesError && !isLoadingLanguages && (
              <View style={styles.languageErrorBox}>
                <Text style={styles.languageErrorText}>
                  {t("settings.language.errors.loadFailed")}
                </Text>
                <Pressable
                  onPress={refetchLanguages}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryLabel}>
                    {t("settings.language.retry")}
                  </Text>
                </Pressable>
              </View>
            )}
            {!isLoadingLanguages && !languagesError && languages.length > 0 && (
              <Select
                options={languages.map((language) => ({
                  label: language.name,
                  value: language.code,
                }))}
                value={
                  languages.some((language) => language.code === i18n.language)
                    ? i18n.language
                    : languages[0].code
                }
                onChange={handleSelectLanguage}
                isOpen={isLanguagePickerOpen}
                onOpen={() => setIsLanguagePickerOpen(true)}
                onClose={() => setIsLanguagePickerOpen(false)}
              />
            )}
          </View>

          <View style={styles.selectColumn}>
            {isLoadingCurrencies && (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={styles.languageLoading}
              />
            )}
            {currenciesError && !isLoadingCurrencies && (
              <View style={styles.languageErrorBox}>
                <Text style={styles.languageErrorText}>
                  {t("settings.currency.errors.loadFailed")}
                </Text>
                <Pressable
                  onPress={refetchCurrencies}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryLabel}>
                    {t("settings.currency.retry")}
                  </Text>
                </Pressable>
              </View>
            )}
            {!isLoadingCurrencies &&
              !currenciesError &&
              currencies.length > 0 && (
                <Select
                  options={currencies.map((currency) => ({
                    label: `${currency.code}  ${currency.symbol}`,
                    value: currency.code,
                  }))}
                  value={
                    currentCurrency &&
                    currencies.some(
                      (currency) => currency.code === currentCurrency,
                    )
                      ? currentCurrency
                      : currencies[0].code
                  }
                  onChange={handleSelectCurrency}
                  isOpen={isCurrencyPickerOpen}
                  onOpen={() => setIsCurrencyPickerOpen(true)}
                  onClose={() => setIsCurrencyPickerOpen(false)}
                />
              )}
          </View>
        </View>

        {balance !== undefined && currentCurrency && (
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>
              {t("settings.balance.title")}
            </Text>
            <Text
              style={[
                styles.balanceValue,
                balance < 0 && { color: colors.danger },
              ]}
            >
              {formatCurrency(balance, currentCurrency, i18n.language)}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>{t("settings.account.title")}</Text>

        {isEditingName ? (
          <View style={styles.nameEditCard}>
            <TextField
              label={t("settings.account.nameLabel")}
              icon={<Icon family="Ionicons" name="person-outline" size={18} color={colors.textSecondary} />}
              value={nameField.value}
              onChangeText={nameField.setValue}
              onBlur={nameField.onBlur}
              placeholder={t("settings.account.namePlaceholder")}
              errorMessage={nameField.errorKey ? translate(nameField.errorKey) : null}
            />
            <View style={styles.nameEditActions}>
              <View style={styles.nameEditButton}>
                <SecondaryButton
                  label={t("settings.account.nameCancel")}
                  onPress={handleCancelEditName}
                  disabled={isSavingName}
                />
              </View>
              <View style={styles.nameEditButton}>
                <PrimaryButton
                  label={t("settings.account.nameSave")}
                  onPress={handleSaveName}
                  isLoading={isSavingName}
                />
              </View>
            </View>
          </View>
        ) : (
          <Pressable onPress={handleStartEditName} style={styles.settingsRow}>
            <View style={styles.settingsIconWrap}>
              <Icon family="Ionicons" name="person-outline" size={18} color={colors.textSecondary} />
            </View>
            <View style={styles.settingsRowTextWrap}>
              <Text style={styles.settingsRowLabel}>{t("settings.account.nameLabel")}</Text>
              <Text style={styles.settingsRowValue}>{user?.name}</Text>
            </View>
            <Icon family="Ionicons" name="create-outline" size={18} color={colors.textSecondary} />
          </Pressable>
        )}

        <Pressable onPress={() => router.push("/plan")} style={styles.planRow}>
          <View style={styles.planIconWrap}>
            <Icon family="Ionicons" name="star" size={18} color={colors.onPrimary} />
          </View>
          <View style={styles.settingsRowTextWrap}>
            <Text style={styles.planRowLabel}>{t("settings.account.planLabel")}</Text>
            <Text style={styles.planRowValue}>{planStatusLabel}</Text>
          </View>
          <Icon family="Ionicons" name="chevron-forward" size={18} color={colors.primary} />
        </Pressable>

        {isBiometricSupported ? (
          <View style={styles.settingsRow}>
            <View style={styles.settingsIconWrap}>
              <Icon family="Ionicons" name="finger-print-outline" size={18} color={colors.textSecondary} />
            </View>
            <Text style={styles.actionLabel}>{t("settings.security.biometricUnlock")}</Text>
            {isTogglingBiometric ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <BiometricToggle
                value={biometricEnabled}
                onValueChange={handleToggleBiometric}
                accessibilityLabel={t("settings.security.biometricUnlock")}
              />
            )}
          </View>
        ) : null}

        <Pressable
          onPress={() => setIsSignOutConfirmVisible(true)}
          style={styles.settingsRow}
        >
          <View style={styles.settingsIconWrap}>
            <Icon family="Ionicons" name="log-out-outline" size={18} color={colors.textSecondary} />
          </View>
          <Text style={styles.actionLabel}>{t("settings.account.signOut")}</Text>
          <Icon family="Ionicons" name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          onPress={() => setIsDeleteConfirmVisible(true)}
          style={styles.signOutButton}
        >
          <View style={styles.signOutIconWrap}>
            <Icon family="Ionicons" name="trash-outline" size={18} color={colors.danger} />
          </View>
          <Text style={styles.signOutLabel}>
            {t("settings.account.deleteAccount.action")}
          </Text>
          <Icon family="Ionicons" name="chevron-forward" size={18} color={colors.danger} />
        </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={isDeleteConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteConfirmVisible(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => !isDeletingAccount && setIsDeleteConfirmVisible(false)}
        >
          <Pressable style={styles.dialog} onPress={() => {}}>
            <View style={styles.dialogIconCircle}>
              <Icon family="Ionicons" name="trash-outline" size={26} color={colors.danger} />
            </View>
            <Text style={styles.dialogTitle}>
              {t("settings.account.deleteAccount.confirmTitle")}
            </Text>
            <Text style={styles.dialogMessage}>
              {t("settings.account.deleteAccount.confirmMessage")}
            </Text>
            <View style={styles.dialogActions}>
              <View style={styles.dialogButton}>
                <SecondaryButton
                  label={t("settings.account.deleteAccount.cancel")}
                  onPress={() => setIsDeleteConfirmVisible(false)}
                  disabled={isDeletingAccount}
                />
              </View>
              <View style={styles.dialogButton}>
                <PrimaryButton
                  label={t("settings.account.deleteAccount.confirm")}
                  tone="danger"
                  onPress={handleConfirmDeleteAccount}
                  isLoading={isDeletingAccount}
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={isSignOutConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSignOutConfirmVisible(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsSignOutConfirmVisible(false)}
        >
          <Pressable style={styles.dialog} onPress={() => {}}>
            <View style={styles.dialogIconCircle}>
              <Icon family="Ionicons" name="log-out-outline" size={26} color={colors.danger} />
            </View>
            <Text style={styles.dialogTitle}>
              {t("settings.account.signOutConfirm.title")}
            </Text>
            <Text style={styles.dialogMessage}>
              {t("settings.account.signOutConfirm.message")}
            </Text>
            <View style={styles.dialogActions}>
              <View style={styles.dialogButton}>
                <SecondaryButton
                  label={t("settings.account.signOutConfirm.cancel")}
                  onPress={() => setIsSignOutConfirmVisible(false)}
                />
              </View>
              <View style={styles.dialogButton}>
                <PrimaryButton
                  label={t("settings.account.signOutConfirm.confirm")}
                  tone="danger"
                  onPress={handleConfirmSignOut}
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={isBiometricPasswordConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelBiometricPasswordConfirm}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => !isConfirmingBiometricPassword && handleCancelBiometricPasswordConfirm()}
        >
          <Pressable style={styles.dialog} onPress={() => {}}>
            <View style={styles.dialogIconCircle}>
              <Icon family="Ionicons" name="finger-print-outline" size={26} color={colors.primary} />
            </View>
            <Text style={styles.dialogTitle}>
              {t("settings.security.confirmPasswordTitle")}
            </Text>
            <Text style={styles.dialogMessage}>
              {t("settings.security.confirmPasswordMessage")}
            </Text>
            <View style={styles.dialogPasswordWrapper}>
              <TextInput
                style={styles.dialogPasswordInput}
                value={biometricPasswordField.value}
                onChangeText={biometricPasswordField.setValue}
                onBlur={biometricPasswordField.onBlur}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                autoFocus
              />
            </View>
            {biometricPasswordError ? (
              <Text style={styles.dialogError}>{biometricPasswordError}</Text>
            ) : null}
            <View style={styles.dialogActions}>
              <View style={styles.dialogButton}>
                <SecondaryButton
                  label={t("settings.security.confirmPasswordCancel")}
                  onPress={handleCancelBiometricPasswordConfirm}
                  disabled={isConfirmingBiometricPassword}
                />
              </View>
              <View style={styles.dialogButton}>
                <PrimaryButton
                  label={t("settings.security.confirmPasswordConfirm")}
                  onPress={handleConfirmBiometricPassword}
                  isLoading={isConfirmingBiometricPassword}
                  disabled={!biometricPasswordField.isValid}
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
      gap: 12,
    },
    title: {
      fontSize: 22,
      fontWeight: "600",
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textSecondary,
      marginTop: 8,
    },
    balanceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 16,
      backgroundColor: colors.card,
    },
    balanceLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    balanceValue: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    appearanceRow: {
      flexDirection: "row",
      gap: 12,
    },
    selectRow: {
      flexDirection: "row",
      gap: 12,
    },
    selectColumn: {
      flex: 1,
      gap: 12,
    },
    appearanceCard: {
      flex: 1,
      alignItems: "center",
      gap: 10,
      paddingVertical: 20,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    appearanceCardActive: {
      borderColor: colors.primary,
      backgroundColor: colors.tabPillActive,
    },
    appearanceCheck: {
      position: "absolute",
      top: 10,
      right: 10,
    },
    appearanceIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    appearanceIconWrapActive: {
      backgroundColor: colors.card,
    },
    appearanceLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    appearanceLabelActive: {
      color: colors.primary,
    },
    languageLoading: {
      marginVertical: 8,
    },
    languageErrorBox: {
      gap: 10,
      alignItems: "flex-start",
    },
    languageErrorText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    retryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: colors.primary,
    },
    retryLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.onPrimary,
    },
    signOutButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor: colors.dangerSurface,
    },
    signOutIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
    },
    signOutLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: "700",
      color: colors.danger,
    },
    settingsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor: colors.card,
    },
    settingsIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    settingsRowTextWrap: {
      flex: 1,
      gap: 2,
    },
    settingsRowLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    settingsRowValue: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    planRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor: colors.tabPillActive,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    planIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
    },
    planRowLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.primary,
    },
    planRowValue: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.primary,
    },
    actionLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    nameEditCard: {
      gap: 14,
      padding: 14,
      borderRadius: 16,
      backgroundColor: colors.card,
    },
    nameEditActions: {
      flexDirection: "row",
      gap: 12,
    },
    nameEditButton: {
      flex: 1,
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
      backgroundColor: colors.card,
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
      backgroundColor: colors.dangerSurface,
    },
    dialogTitle: {
      fontSize: 18,
      fontWeight: "700",
      textAlign: "center",
      color: colors.text,
    },
    dialogMessage: {
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 14,
      color: colors.textSecondary,
    },
    dialogActions: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
    },
    dialogButton: {
      flex: 1,
    },
    dialogPasswordWrapper: {
      width: "100%",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 4,
    },
    dialogPasswordInput: {
      paddingVertical: 10,
      fontSize: 16,
      color: colors.text,
    },
    dialogError: {
      color: colors.danger,
      fontSize: 13,
      textAlign: "center",
      marginBottom: 8,
    },
  });
