import {
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetMethods,
} from "@expo/ui/community/bottom-sheet";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text } from "react-native";

import { Icon } from "@/components/general/Icon";
import { useApiResource } from "@/hooks/useApiResource";
import { useAppTheme } from "@/hooks/useAppTheme";
import { setAppLanguage } from "@/i18n";
import { getLanguages } from "@/services/settings";

// Compact language switcher for screens outside the authenticated app
// (sign-in/sign-up) where there's no user session yet to sync the choice
// to the backend — it only changes the device-local i18next language via
// setAppLanguage, same as the picker in Settings.
export function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const { data, isLoading, error } = useApiResource(getLanguages);
  const languages = data?.data ?? [];
  const [isOpen, setIsOpen] = useState(false);
  const sheetRef = useRef<BottomSheetMethods>(null);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isOpen]);

  if (isLoading || error || languages.length === 0) {
    return null;
  }

  const handleSelect = async (code: string) => {
    setIsOpen(false);
    if (code === i18n.language) return;
    await setAppLanguage(code);
  };

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t("settings.language.title")}
        hitSlop={8}
        style={[
          styles.trigger,
          { borderColor: colors.border, backgroundColor: colors.inputBackground },
        ]}
      >
        <Icon
          family="Ionicons"
          name="globe-outline"
          size={16}
          color={colors.textSecondary}
        />
        <Text style={[styles.triggerLabel, { color: colors.text }]}>
          {i18n.language.toUpperCase()}
        </Text>
      </Pressable>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={["50%"]}
        enablePanDownToClose
        onDismiss={() => setIsOpen(false)}
        backgroundStyle={{ backgroundColor: colors.card }}
      >
        <BottomSheetScrollView
          bounces={false}
          contentContainerStyle={styles.list}
        >
          {languages.map((language) => {
            const isActive = language.code === i18n.language;
            return (
              <Pressable
                key={language.code}
                onPress={() => handleSelect(language.code)}
                style={[
                  styles.option,
                  isActive && { backgroundColor: colors.tabPillActive },
                ]}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    { color: isActive ? colors.primary : colors.text },
                    isActive && styles.optionLabelActive,
                  ]}
                >
                  {language.name}
                </Text>
                {isActive && (
                  <Icon
                    family="Ionicons"
                    name="checkmark"
                    size={18}
                    color={colors.primary}
                  />
                )}
              </Pressable>
            );
          })}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1.5,
  },
  triggerLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 24,
    paddingTop: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  optionLabelActive: {
    fontWeight: "700",
  },
});
