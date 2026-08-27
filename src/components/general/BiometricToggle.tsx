import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Icon } from "@/components/general/Icon";
import { useAppTheme } from "@/hooks/useAppTheme";

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 30;
const THUMB_SIZE = 24;
const THUMB_INSET = (TRACK_HEIGHT - THUMB_SIZE) / 2;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - THUMB_INSET * 2;

type BiometricToggleProps = {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function BiometricToggle({
  value,
  onValueChange,
  disabled,
  accessibilityLabel,
}: BiometricToggleProps) {
  const { colors } = useAppTheme();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are mutable by design
    progress.value = withSpring(value ? 1 : 0, { damping: 16, stiffness: 180 });
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.border, colors.primary],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: THUMB_INSET + progress.value * THUMB_TRAVEL }],
  }));

  const iconWrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.85 + progress.value * 0.15 }],
  }));

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={disabled && styles.disabled}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]}>
          <Animated.View style={iconWrapStyle}>
            <Icon
              family="Ionicons"
              name="finger-print"
              size={15}
              color={value ? colors.primary : colors.textSecondary}
            />
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
    justifyContent: "center",
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
  disabled: {
    opacity: 0.5,
  },
});
