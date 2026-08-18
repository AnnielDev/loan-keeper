import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

export type BadgeTone = "primary" | "success" | "danger" | "warning" | "neutral";

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  icon?: ReactNode;
};

export function Badge({ label, tone = "neutral", icon }: BadgeProps) {
  const { colors } = useAppTheme();

  const toneStyles: Record<BadgeTone, { background: string; text: string }> = {
    primary: { background: colors.tabPillActive, text: colors.primary },
    success: { background: colors.successSurface, text: colors.success },
    danger: { background: colors.dangerSurface, text: colors.danger },
    warning: { background: colors.warningSurface, text: colors.warning },
    neutral: { background: colors.surface, text: colors.textSecondary },
  };
  const { background, text } = toneStyles[tone];

  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      {icon}
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
});
