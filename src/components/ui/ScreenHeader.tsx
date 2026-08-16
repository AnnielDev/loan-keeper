import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type ScreenHeaderProps = {
  eyebrow: string;
  title: string;
};

export function ScreenHeader({ eyebrow, title }: ScreenHeaderProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>{eyebrow}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "500",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
});
