import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type SegmentedToggleOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedToggleProps<T extends string> = {
  options: SegmentedToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * iOS-style inset toggle: a single rounded track with a solid pill marking
 * the active segment, as opposed to SegmentedControl's separate filter pills.
 */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: SegmentedToggleProps<T>) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.track, { backgroundColor: colors.surface }]}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              isActive && { backgroundColor: colors.card },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? colors.primary : colors.textSecondary },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
  },
  segment: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
});
