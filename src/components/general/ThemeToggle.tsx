import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Icon } from "@/components/general/Icon";
import { useAppTheme } from "@/hooks/useAppTheme";

const TRACK_WIDTH = 56;
const TRACK_HEIGHT = 30;
const THUMB_SIZE = 24;
const THUMB_INSET = (TRACK_HEIGHT - THUMB_SIZE) / 2;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - THUMB_INSET * 2;

const TRACK_COLOR_LIGHT = "#8ECAE6";
const TRACK_COLOR_DARK = "#161B2E";

const STARS = [
  { top: 6, left: 10 },
  { top: 16, left: 18 },
  { top: 10, left: 26 },
];

export function ThemeToggle() {
  const { t } = useTranslation();
  const { scheme, setMode } = useAppTheme();
  const isDark = scheme === "dark";
  const progress = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are mutable by design
    progress.value = withSpring(isDark ? 1 : 0, { damping: 16, stiffness: 180 });
  }, [isDark, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [TRACK_COLOR_LIGHT, TRACK_COLOR_DARK],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: THUMB_INSET + progress.value * THUMB_TRAVEL }],
  }));

  const starsStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const sunStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ scale: 1 - progress.value * 0.4 }],
  }));

  const moonStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.6 + progress.value * 0.4 }],
  }));

  return (
    <Pressable
      onPress={() => setMode(isDark ? "light" : "dark")}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
      accessibilityLabel={t("settings.theme.toggle")}
      hitSlop={8}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.stars, starsStyle]} pointerEvents="none">
          {STARS.map((pos, index) => (
            <Animated.View key={index} style={[styles.star, pos]} />
          ))}
        </Animated.View>

        <Animated.View style={[styles.thumb, thumbStyle]}>
          <Animated.View style={[styles.icon, sunStyle]}>
            <Icon family="Ionicons" name="sunny" size={15} color="#F59E0B" />
          </Animated.View>
          <Animated.View style={[styles.icon, styles.iconOverlay, moonStyle]}>
            <Icon family="Ionicons" name="moon" size={13} color="#4C1D95" />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    overflow: "hidden",
  },
  stars: {
    ...StyleSheet.absoluteFill,
  },
  star: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#E5E7EB",
  },
  thumb: {
    position: "absolute",
    top: THUMB_INSET,
    left: 0,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  icon: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  iconOverlay: {
    position: "absolute",
  },
});
