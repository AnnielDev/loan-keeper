import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/general/Icon";
import { Select } from "@/components/ui/Select";
import type { ColorScheme, ThemeColors } from "@/constants/theme";
import { useApiResource } from "@/hooks/useApiResource";
import { useAppTheme } from "@/hooks/useAppTheme";
import { setAppLanguage } from "@/i18n";
import {
  getCurrencies,
  getLanguages,
  updateCurrency,
  updateLanguage,
} from "@/services/settings";
import { useAuthStore } from "@/store/auth";

const appearanceOptions: { scheme: ColorScheme; icon: "sunny" | "moon" }[] = [
  { scheme: "light", icon: "sunny" },
  { scheme: "dark", icon: "moon" },
];

export default function SettingsTabScreen() {
  const { t, i18n } = useTranslation();
  const signOut = useAuthStore((state) => state.signOut);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { colors, scheme, setMode } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isLanguagePickerOpen, setIsLanguagePickerOpen] = useState(false);
  const [isCurrencyPickerOpen, setIsCurrencyPickerOpen] = useState(false);

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

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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

        <Text style={styles.sectionTitle}>{t("settings.account.title")}</Text>
        <Pressable onPress={signOut} style={styles.signOutButton}>
          <View style={styles.signOutIconWrap}>
            <Icon family="Ionicons" name="log-out-outline" size={18} color={colors.danger} />
          </View>
          <Text style={styles.signOutLabel}>{t("settings.account.signOut")}</Text>
          <Icon family="Ionicons" name="chevron-forward" size={18} color={colors.danger} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
  });
