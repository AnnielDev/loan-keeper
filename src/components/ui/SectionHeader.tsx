import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type SectionHeaderProps = {
  title: string;
  action?: {
    label: string;
    onPress: () => void;
  };
};

export function SectionHeader({ title, action }: SectionHeaderProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {action && (
        <Pressable onPress={action.onPress} hitSlop={8}>
          <Text style={[styles.action, { color: colors.primary }]}>
            {action.label}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  action: {
    fontSize: 13,
    fontWeight: "600",
  },
});
