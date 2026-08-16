import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type IconActionButtonProps = {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  disabled?: boolean;
};

export function IconActionButton({ label, icon, onPress, disabled }: IconActionButtonProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor: colors.surface, borderColor: colors.border },
        disabled && styles.disabled,
      ]}
    >
      {icon}
      <Text style={[styles.label, { color: colors.primary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
});
