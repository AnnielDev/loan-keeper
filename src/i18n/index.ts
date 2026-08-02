/* eslint-disable import/no-named-as-default-member -- i18next's default export is the singleton instance; `.use`/`.changeLanguage` here are its instance methods, not the named exports. */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import hi from "./locales/hi.json";
import zh from "./locales/zh.json";

export const resources = {
  en: { translation: en },
  es: { translation: es },
  zh: { translation: zh },
  hi: { translation: hi },
  fr: { translation: fr },
} as const;

export const supportedLanguages = Object.keys(resources) as SupportedLanguage[];
export type SupportedLanguage = keyof typeof resources;

const LANGUAGE_STORAGE_KEY = "loan-keeper.language";

function isSupportedLanguage(value: string | undefined): value is SupportedLanguage {
  return !!value && (supportedLanguages as string[]).includes(value);
}

function getDeviceLanguage(): SupportedLanguage {
  const languageCode = getLocales()[0]?.languageCode ?? undefined;
  return isSupportedLanguage(languageCode) ? languageCode : "en";
}

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((storedLanguage) => {
  if (isSupportedLanguage(storedLanguage ?? undefined)) {
    i18n.changeLanguage(storedLanguage as SupportedLanguage);
  }
});

export async function setAppLanguage(language: SupportedLanguage | "system") {
  if (language === "system") {
    await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY);
    await i18n.changeLanguage(getDeviceLanguage());
    return;
  }

  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  await i18n.changeLanguage(language);
}

export default i18n;
