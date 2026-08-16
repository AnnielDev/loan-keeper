import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

export type StatCardTone = "primary" | "success" | "danger" | "neutral";

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: StatCardTone;
  layout?: "card" | "pill";
  /** "card" layout only: icon + label side by side instead of stacked. Only use when there's no `trailing`. */
  inline?: boolean;
  trailing?: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function StatCard({
  icon,
  label,
  value,
  tone = "neutral",
  layout = "card",
  inline = false,
  trailing,
  onPress,
  style,
}: StatCardProps) {
  const { colors } = useAppTheme();

  const cardBackground: Record<StatCardTone, string> = {
    primary: colors.surface,
    success: colors.successSurface,
    danger: colors.dangerSurface,
    neutral: colors.surface,
  };
  const iconBackground: Record<StatCardTone, string> = {
    primary: colors.primary,
    success: colors.success,
    danger: colors.danger,
    neutral: colors.primary,
  };

  if (layout === "pill") {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole={onPress ? "button" : undefined}
        style={[
          styles.pill,
          { backgroundColor: colors.card, borderColor: colors.border },
          style,
        ]}
      >
        <View
          style={[styles.pillIcon, { backgroundColor: iconBackground[tone] }]}
        >
          {icon}
        </View>
        <Text style={[styles.pillValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.pillLabel, { color: colors.textSecondary }]}>
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={[styles.card, { backgroundColor: cardBackground[tone] }, style]}
    >
      {inline ? (
        <View style={styles.inlineHeader}>
          <View
            style={[styles.cardIcon, { backgroundColor: iconBackground[tone] }]}
          >
            {icon}
          </View>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            {label}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.cardHeader}>
            <View
              style={[styles.cardIcon, { backgroundColor: iconBackground[tone] }]}
            >
              {icon}
            </View>
            {trailing}
          </View>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            {label}
          </Text>
        </>
      )}
      <Text style={[styles.cardValue, { color: colors.text }]}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  pill: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 4,
  },
  pillIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  pillValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  pillLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
});
