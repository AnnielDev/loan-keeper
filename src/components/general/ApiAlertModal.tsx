import { useTranslation } from "react-i18next";
import { Modal, StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";

import { Icon } from "@/components/general/Icon";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useApiAlertStore } from "@/store/apiAlert";

export function ApiAlertModal() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const visible = useApiAlertStore((state) => state.visible);
  const title = useApiAlertStore((state) => state.title);
  const message = useApiAlertStore((state) => state.message);
  const hideApiAlert = useApiAlertStore((state) => state.hideApiAlert);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={hideApiAlert}>
      <Pressable style={styles.backdrop} onPress={hideApiAlert}>
        <Pressable style={[styles.dialog, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={[styles.iconCircle, { backgroundColor: colors.dangerSurface }]}>
            <Icon family="Ionicons" name="alert-circle-outline" size={26} color={colors.danger} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          <View style={styles.button}>
            <PrimaryButton label={t("common.ok")} tone="danger" onPress={hideApiAlert} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 14,
  },
  button: {
    width: "100%",
  },
});
