import {
  setAppLanguage,
  supportedLanguages,
  type SupportedLanguage,
} from "@/i18n";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { ThemeColors } from "@/constants/theme";
import type { ThemeMode } from "@/store/theme";
import { useAuthStore } from "@/store/auth";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const languageLabels: Record<SupportedLanguage, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
  hi: "हिन्दी",
  fr: "Français",
};

const themeModes: ThemeMode[] = ["light", "dark", "system"];

export default function SettingsTabScreen() {
  const { t, i18n } = useTranslation();
  const signOut = useAuthStore((state) => state.signOut);
  const { colors, mode, setMode } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <Text style={styles.title}>{t("tabs.settings")}</Text>

      <Text style={styles.sectionTitle}>{t("settings.theme.title")}</Text>
      <View style={styles.options}>
        {themeModes.map((themeMode) => (
          <Pressable
            key={themeMode}
            onPress={() => setMode(themeMode)}
            style={[styles.option, mode === themeMode && styles.optionActive]}
          >
            <Text
              style={[
                styles.optionLabel,
                mode === themeMode && styles.optionLabelActive,
              ]}
            >
              {t(`settings.theme.${themeMode}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>{t("settings.language.title")}</Text>
      <View style={styles.options}>
        {supportedLanguages.map((language) => (
          <Pressable
            key={language}
            onPress={() => setAppLanguage(language)}
            style={[
              styles.option,
              i18n.language === language && styles.optionActive,
            ]}
          >
            <Text
              style={[
                styles.optionLabel,
                i18n.language === language && styles.optionLabelActive,
              ]}
            >
              {languageLabels[language]}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => setAppLanguage("system")}
          style={styles.option}
        >
          <Text style={styles.optionLabel}>
            {t("settings.language.system")}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>{t("settings.account.title")}</Text>
      <Pressable onPress={signOut} style={styles.signOutButton}>
        <Text style={styles.signOutLabel}>{t("settings.account.signOut")}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      gap: 12,
      backgroundColor: colors.background,
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
    options: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    option: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionLabel: {
      fontSize: 14,
      color: colors.text,
    },
    optionLabelActive: {
      color: colors.onPrimary,
    },
    signOutButton: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.danger,
      alignSelf: "flex-start",
    },
    signOutLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.danger,
    },
  });
