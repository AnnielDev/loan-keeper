import { useTranslation } from "react-i18next";
import { StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/hooks/useAppTheme";
import { useNetworkStore } from "@/store/network";

export function OfflineBanner() {
  const { t } = useTranslation();
  const isOffline = useNetworkStore((state) => state.isOffline);
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  if (!isOffline) return null;

  return (
    <Text
      style={[
        styles.banner,
        { backgroundColor: colors.danger, paddingTop: insets.top + 6 },
      ]}
    >
      {t("network.offline")}
    </Text>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    paddingBottom: 6,
  },
});
