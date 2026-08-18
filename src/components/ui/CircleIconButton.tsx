import type { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

export type CircleIconButtonTone = "primary" | "neutral";

type CircleIconButtonProps = {
  icon: ReactNode;
  onPress: () => void;
  tone?: CircleIconButtonTone;
};

export function CircleIconButton({ icon, onPress, tone = "primary" }: CircleIconButtonProps) {
  const { colors } = useAppTheme();

  const background: Record<CircleIconButtonTone, string> = {
    primary: colors.tabPillActive,
    neutral: colors.card,
  };

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={[styles.button, { backgroundColor: background[tone] }]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
