import type { PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type CardProps = PropsWithChildren<{
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}>;

export function Card({ children, backgroundColor, style }: CardProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: backgroundColor ?? colors.card }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
  },
});
