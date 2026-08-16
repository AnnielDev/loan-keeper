import type { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type FloatingActionButtonProps = {
  icon: ReactNode;
  onPress: () => void;
};

export function FloatingActionButton({ icon, onPress }: FloatingActionButtonProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.button, { backgroundColor: colors.primary }]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
