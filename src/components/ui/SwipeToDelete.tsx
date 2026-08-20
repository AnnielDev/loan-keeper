import { type ReactNode, useRef, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Swipeable, { type SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";

import { Icon } from "@/components/general/Icon";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { useAppTheme } from "@/hooks/useAppTheme";

type SwipeToDeleteProps = {
  children: ReactNode;
  onDelete: () => void;
  actionLabel: string;
  confirmTitle: string;
  confirmMessage: string;
  cancelLabel: string;
  confirmLabel: string;
};

type DeleteActionProps = {
  progress: SharedValue<number>;
  color: string;
  label: string;
  onPress: () => void;
};

function DeleteAction({ progress, color, label, onPress }: DeleteActionProps) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.6, 1], [0, 0.7, 1], "clamp"),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.5, 1], "clamp") }],
  }));

  return (
    <View style={styles.action}>
      <Pressable onPress={onPress} hitSlop={8}>
        {({ pressed }) => (
          <Animated.View
            style={[styles.panel, { backgroundColor: color, opacity: pressed ? 0.85 : 1 }, style]}
          >
            <View style={styles.iconBadge}>
              <Icon family="Ionicons" name="trash-outline" size={18} color={color} />
            </View>
            <Text style={styles.actionLabel}>{label}</Text>
          </Animated.View>
        )}
      </Pressable>
    </View>
  );
}

export function SwipeToDelete({
  children,
  onDelete,
  actionLabel,
  confirmTitle,
  confirmMessage,
  cancelLabel,
  confirmLabel,
}: SwipeToDeleteProps) {
  const { colors } = useAppTheme();
  const swipeableRef = useRef<SwipeableMethods>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handlePress = () => {
    swipeableRef.current?.close();
    setConfirmVisible(true);
  };

  const handleCancel = () => setConfirmVisible(false);

  const handleConfirm = () => {
    setConfirmVisible(false);
    onDelete();
  };

  return (
    <>
      <Swipeable
        ref={swipeableRef}
        leftThreshold={40}
        overshootLeft={false}
        renderLeftActions={(progress) => (
          <DeleteAction progress={progress} color={colors.danger} label={actionLabel} onPress={handlePress} />
        )}
      >
        {children}
      </Swipeable>

      <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={handleCancel}>
        <Pressable style={styles.backdrop} onPress={handleCancel}>
          <Pressable
            style={[styles.dialog, { backgroundColor: colors.card }]}
            onPress={() => {}}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.dangerSurface }]}>
              <Icon family="Ionicons" name="trash-outline" size={26} color={colors.danger} />
            </View>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>{confirmTitle}</Text>
            <Text style={[styles.dialogMessage, { color: colors.textSecondary }]}>{confirmMessage}</Text>
            <View style={styles.dialogActions}>
              <View style={styles.dialogButton}>
                <SecondaryButton label={cancelLabel} onPress={handleCancel} />
              </View>
              <View style={styles.dialogButton}>
                <PrimaryButton label={confirmLabel} tone="danger" onPress={handleConfirm} />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  action: {
    width: 96,
    justifyContent: "center",
    alignItems: "center",
  },
  panel: {
    width: 80,
    paddingVertical: 18,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
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
  dialogTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  dialogMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 14,
  },
  dialogActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  dialogButton: {
    flex: 1,
  },
});
