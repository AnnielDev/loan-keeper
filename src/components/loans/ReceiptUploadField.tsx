import { Image } from "expo-image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/general/Icon";
import { PhotoSourceSheet } from "@/components/ui/PhotoSourceSheet";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useImageUpload, type ImageSource } from "@/hooks/useImageUpload";

type ReceiptUploadFieldProps = {
  value: string | null;
  onChange: (url: string | null) => void;
};

export function ReceiptUploadField({ value, onChange }: ReceiptUploadFieldProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { pickAndUpload, isUploading } = useImageUpload();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSelect = async (source: ImageSource) => {
    const url = await pickAndUpload(source);
    if (url) onChange(url);
  };

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{t("paymentForm.fields.receipt")}</Text>

      {value ? (
        <View style={styles.thumbWrapper}>
          <Image source={{ uri: value }} style={styles.thumb} contentFit="cover" />
          <Pressable
            onPress={() => onChange(null)}
            style={[styles.thumbRemove, { backgroundColor: colors.danger }]}
          >
            <Icon family="Ionicons" name="close" size={12} color="#FFFFFF" />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={() => setIsSheetOpen(true)}
          disabled={isUploading}
          style={[styles.dashedBox, { borderColor: colors.border }]}
        >
          {isUploading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Icon family="Ionicons" name="camera-outline" size={22} color={colors.primary} />
              <Text style={[styles.cta, { color: colors.primary }]}>{t("paymentForm.receiptCta")}</Text>
            </>
          )}
        </Pressable>
      )}

      <PhotoSourceSheet
        visible={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={t("paymentForm.fields.receipt")}
        cameraLabel={t("customerForm.photo.camera")}
        galleryLabel={t("customerForm.photo.gallery")}
        cancelLabel={t("customerForm.photo.cancel")}
        onSelectCamera={() => handleSelect("camera")}
        onSelectGallery={() => handleSelect("library")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  dashedBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  cta: {
    fontSize: 13,
    fontWeight: "600",
  },
  thumbWrapper: {
    width: 56,
    height: 56,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  thumbRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
});
