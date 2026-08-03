import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";
import { Platform, StyleSheet, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

export function TabBarBackground() {
  const { colors, scheme } = useAppTheme();

  if (Platform.OS === "ios" && isGlassEffectAPIAvailable()) {
    return (
      <GlassView
        style={StyleSheet.absoluteFill}
        glassEffectStyle="regular"
        tintColor={scheme === "dark" ? "#000000" : "#FFFFFF"}
      />
    );
  }

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: colors.tabBarBackground },
      ]}
    />
  );
}
