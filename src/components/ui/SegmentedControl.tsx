import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type SegmentedControlOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Renders content-sized pills in a horizontally scrollable row instead of
   * equal-width pills filling the container. Use when there are more options
   * than comfortably fit on screen at once. */
  scrollable?: boolean;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  scrollable = false,
}: SegmentedControlProps<T>) {
  const { colors } = useAppTheme();

  const pills = options.map((option) => {
    const isActive = option.value === value;
    return (
      <Pressable
        key={option.value}
        onPress={() => onChange(option.value)}
        style={[
          styles.pill,
          scrollable && styles.pillContentSized,
          { backgroundColor: isActive ? colors.primary : colors.surface },
        ]}
      >
        <Text style={[styles.label, { color: isActive ? colors.onPrimary : colors.textSecondary }]}>
          {option.label}
        </Text>
      </Pressable>
    );
  });

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollRow}
      >
        {pills}
      </ScrollView>
    );
  }

  return <View style={styles.row}>{pills}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  scrollRow: {
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pillContentSized: {
    flex: 0,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
});
