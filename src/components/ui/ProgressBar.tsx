import { StyleSheet, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

export type ProgressBarTone = "primary" | "success" | "danger";

type ProgressBarProps = {
  progress: number;
  tone?: ProgressBarTone;
};

export function ProgressBar({ progress, tone = "primary" }: ProgressBarProps) {
  const { colors } = useAppTheme();
  const clamped = Math.min(100, Math.max(0, progress));

  const fillColor: Record<ProgressBarTone, string> = {
    primary: colors.primary,
    success: colors.success,
    danger: colors.danger,
  };

  return (
    <View style={[styles.track, { backgroundColor: colors.border }]}>
      <View
        style={[styles.fill, { width: `${clamped}%`, backgroundColor: fillColor[tone] }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
});
