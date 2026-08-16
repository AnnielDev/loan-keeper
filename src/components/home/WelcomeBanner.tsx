import { useTranslation } from "react-i18next";
import { StyleSheet, Text } from "react-native";

import { Card } from "@/components/ui/Card";
import { useAppTheme } from "@/hooks/useAppTheme";

type WelcomeBannerProps = {
  name: string;
  pendingToday: number;
};

export function WelcomeBanner({ name, pendingToday }: WelcomeBannerProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <Card backgroundColor={colors.primary} style={styles.card}>
      <Text style={[styles.eyebrow, { color: colors.onPrimary }]}>
        {t("home.summary.title").toUpperCase()}
      </Text>
      <Text style={[styles.greeting, { color: colors.onPrimary }]}>
        {t("home.summary.greeting", { name })}
      </Text>
      <Text style={[styles.subtitle, { color: colors.onPrimary }]}>
        {t("home.summary.subtitle", { count: pendingToday })}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    opacity: 0.85,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.9,
  },
});
