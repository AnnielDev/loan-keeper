import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import type { RiskLevel } from "@/types/customer";

const SEGMENTS = 3;

const FILLED_SEGMENTS: Record<RiskLevel, number> = {
  bajo: 1,
  medio: 2,
  alto: 3,
};

type RiskMeterProps = {
  level: RiskLevel;
};

export function RiskMeter({ level }: RiskMeterProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const filled = FILLED_SEGMENTS[level];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.onPrimary }]}>
        {t("customerDetail.risk.label")} {t(`customerDetail.risk.${level}`)}
      </Text>
      <View style={styles.bars}>
        {Array.from({ length: SEGMENTS }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              { backgroundColor: colors.onPrimary, opacity: index < filled ? 1 : 0.35 },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  bars: {
    flexDirection: "row",
    gap: 4,
  },
  bar: {
    width: 20,
    height: 4,
    borderRadius: 2,
  },
});
