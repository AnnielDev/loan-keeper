import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type InfoRowProps = {
  icon: ReactNode;
  label: string;
  value: string;
  trailing?: ReactNode;
};

export function InfoRow({ icon, label, value, trailing }: InfoRowProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={[styles.iconBadge, { backgroundColor: colors.card }]}>{icon}</View>
      <View style={styles.text}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
          {value}
        </Text>
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
  value: {
    fontSize: 15,
    fontWeight: "600",
  },
});
