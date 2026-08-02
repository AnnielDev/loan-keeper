import { useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const ACTIVE_PILL_COLOR = "rgba(37, 99, 235, 0.12)";

type TabBarButtonProps = Omit<PressableProps, "children" | "style"> & {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function TabBarButton({
  children,
  accessibilityState,
  style,
  onPressIn,
  onPressOut,
  ...pressableProps
}: TabBarButtonProps) {
  const isSelected = accessibilityState?.selected ?? false;
  const pillProgress = useSharedValue(isSelected ? 1 : 0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    pillProgress.value = withSpring(isSelected ? 1 : 0, { damping: 16, stiffness: 220 });
  }, [isSelected, pillProgress]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillProgress.value,
    transform: [{ scale: 0.6 + pillProgress.value * 0.4 }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  return (
    <Pressable
      {...pressableProps}
      accessibilityState={accessibilityState}
      style={[styles.button, style]}
      onPressIn={(event) => {
        // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are mutable by design
        pressScale.value = withTiming(0.88, { duration: 100 });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are mutable by design
        pressScale.value = withTiming(1, { duration: 150 });
        onPressOut?.(event);
      }}
    >
      <Animated.View style={[styles.pill, pillStyle]} />
      <Animated.View style={contentStyle}>{children}</Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    position: "absolute",
    width: 48,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACTIVE_PILL_COLOR,
  },
});
