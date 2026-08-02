import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";
import { Platform, StyleSheet, View } from "react-native";

const FALLBACK_BACKGROUND_COLOR = "rgba(255, 255, 255, 0.92)";

export function TabBarBackground() {
  if (Platform.OS === "ios" && isGlassEffectAPIAvailable()) {
    return (
      <GlassView
        style={StyleSheet.absoluteFill}
        glassEffectStyle="regular"
        tintColor="#FFFFFF"
      />
    );
  }

  return <View style={[StyleSheet.absoluteFill, styles.fallback]} />;
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: FALLBACK_BACKGROUND_COLOR,
  },
});
