import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

export type PrimaryButtonTone = "primary" | "success" | "danger";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  tone?: PrimaryButtonTone;
  isLoading?: boolean;
  disabled?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  icon,
  tone = "primary",
  isLoading,
  disabled,
}: PrimaryButtonProps) {
  const { colors } = useAppTheme();
  const isDisabled = disabled || isLoading;
  const backgroundColor =
    tone === "success"
      ? colors.successSurface
      : tone === "danger"
        ? colors.danger
        : colors.primary;
  const foregroundColor =
    tone === "success" ? colors.success : colors.onPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        { backgroundColor },
        isDisabled && styles.disabled,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={foregroundColor} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.label, { color: foregroundColor }]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
});
