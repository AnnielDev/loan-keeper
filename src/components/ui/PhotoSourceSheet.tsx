import {
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetMethods,
} from "@expo/ui/community/bottom-sheet";
import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { Icon } from "@/components/general/Icon";
import { useAppTheme } from "@/hooks/useAppTheme";

type PhotoSourceSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  cameraLabel: string;
  galleryLabel: string;
  cancelLabel: string;
  onSelectCamera: () => void;
  onSelectGallery: () => void;
};

export function PhotoSourceSheet({
  visible,
  onClose,
  title,
  cameraLabel,
  galleryLabel,
  cancelLabel,
  onSelectCamera,
  onSelectGallery,
}: PhotoSourceSheetProps) {
  const { colors } = useAppTheme();
  const sheetRef = useRef<BottomSheetMethods>(null);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      enablePanDownToClose
      onDismiss={onClose}
      backgroundStyle={{ backgroundColor: colors.card }}
    >
      <BottomSheetView style={styles.content}>
        <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>

        <Pressable
          onPress={() => {
            sheetRef.current?.dismiss();
            onSelectCamera();
          }}
          style={[styles.option, { borderColor: colors.border }]}
        >
          <Icon family="Ionicons" name="camera-outline" size={20} color={colors.primary} />
          <Text style={[styles.optionLabel, { color: colors.text }]}>{cameraLabel}</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            sheetRef.current?.dismiss();
            onSelectGallery();
          }}
          style={[styles.option, { borderColor: colors.border }]}
        >
          <Icon family="Ionicons" name="images-outline" size={20} color={colors.primary} />
          <Text style={[styles.optionLabel, { color: colors.text }]}>{galleryLabel}</Text>
        </Pressable>

        <Pressable
          onPress={() => sheetRef.current?.dismiss()}
          style={[styles.cancel, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.cancelLabel, { color: colors.danger }]}>{cancelLabel}</Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  cancel: {
    marginTop: 6,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
});
