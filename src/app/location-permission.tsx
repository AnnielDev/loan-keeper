import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/general/Icon";
import type { ThemeColors } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { updateLocation } from "@/services/settings";
import { useAuthStore } from "@/store/auth";
import { useLocationAccessStore } from "@/store/location";
import { requestDeviceLocation } from "@/utils/deviceLocation";

export default function LocationPermissionScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [isRequesting, setIsRequesting] = useState(false);
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async () => {
    setError(null);
    setIsRequesting(true);
    try {
      const result = await requestDeviceLocation();
      if (result.status === "denied") {
        setCanAskAgain(result.canAskAgain);
        setError(t("locationGate.denied"));
        return;
      }
      if (result.status === "error") {
        setError(t("locationGate.error"));
        return;
      }

      const { data } = await updateLocation(result.location);
      updateUser(data);
      useLocationAccessStore.setState({ isGranted: true });
    } catch {
      setError(t("locationGate.error"));
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Icon
          family="Ionicons"
          name="location-outline"
          size={48}
          color={colors.primary}
        />
        <Text style={styles.title}>{t("locationGate.title")}</Text>
        <Text style={styles.description}>{t("locationGate.description")}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, isRequesting && styles.buttonDisabled]}
          onPress={canAskAgain ? handleRequest : () => Linking.openSettings()}
          disabled={isRequesting}
        >
          {isRequesting ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.buttonLabel}>
              {canAskAgain
                ? t("locationGate.allow")
                : t("locationGate.openSettings")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
      gap: 12,
    },
    title: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 8,
    },
    error: {
      fontSize: 13,
      color: colors.danger,
      textAlign: "center",
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
      minWidth: 200,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonLabel: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: "600",
    },
  });
