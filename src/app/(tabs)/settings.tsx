import { setAppLanguage, supportedLanguages, type SupportedLanguage } from '@/i18n';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const languageLabels: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  zh: '中文',
  hi: 'हिन्दी',
  fr: 'Français',
};

export default function SettingsTabScreen() {
  const { t, i18n } = useTranslation();

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Text style={styles.title}>{t('tabs.settings')}</Text>

      <Text style={styles.sectionTitle}>{t('settings.language.title')}</Text>
      <View style={styles.options}>
        {supportedLanguages.map((language) => (
          <Pressable
            key={language}
            onPress={() => setAppLanguage(language)}
            style={[styles.option, i18n.language === language && styles.optionActive]}
          >
            <Text
              style={[styles.optionLabel, i18n.language === language && styles.optionLabelActive]}
            >
              {languageLabels[language]}
            </Text>
          </Pressable>
        ))}
        <Pressable onPress={() => setAppLanguage('system')} style={styles.option}>
          <Text style={styles.optionLabel}>{t('settings.language.system')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 8,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  optionActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  optionLabel: {
    fontSize: 14,
    color: '#111827',
  },
  optionLabelActive: {
    color: '#FFFFFF',
  },
});
