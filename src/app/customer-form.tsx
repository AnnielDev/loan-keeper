import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/general/Icon";
import { AvatarPicker } from "@/components/ui/AvatarPicker";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { IconActionButton } from "@/components/ui/IconActionButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useFormField } from "@/hooks/useFormField";
import { type ImageSource, useImageUpload } from "@/hooks/useImageUpload";
import { ApiError } from "@/services/api";
import { createCustomer } from "@/services/customers";
import { MAX_NAME_LENGTH, email as emailRule, maxLength, optional, required } from "@/utils/validation";

export default function CustomerFormScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const fullNameField = useFormField<string>(
    "",
    useMemo(() => [required(), maxLength(MAX_NAME_LENGTH)], []),
  );
  const documentIdField = useFormField<string>("", useMemo(() => [required()], []));
  const phoneField = useFormField<string>("", []);
  const emailField = useFormField<string>("", useMemo(() => [optional(emailRule())], []));
  const addressField = useFormField<string>("", []);
  const cityField = useFormField<string>("", []);
  const occupationField = useFormField<string>("", []);
  const [monthlyIncome, setMonthlyIncome] = useState("");

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [documentUrls, setDocumentUrls] = useState<string[]>([]);
  const avatarUpload = useImageUpload();
  const documentUpload = useImageUpload();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const translate = t as unknown as (key: string) => string;

  const canSubmit =
    fullNameField.isValid && documentIdField.isValid && emailField.isValid && !isSubmitting;

  const pickAvatar = async (source: ImageSource) => {
    const url = await avatarUpload.pickAndUpload(source);
    if (url) setAvatarUrl(url);
  };

  const handlePickAvatar = () => {
    Alert.alert(t("customerForm.photo.title"), undefined, [
      { text: t("customerForm.photo.camera"), onPress: () => pickAvatar("camera") },
      { text: t("customerForm.photo.gallery"), onPress: () => pickAvatar("library") },
      { text: t("customerForm.photo.cancel"), style: "cancel" },
    ]);
  };

  const handleAddDocument = async (source: ImageSource) => {
    const url = await documentUpload.pickAndUpload(source);
    if (url) setDocumentUrls((prev) => [...prev, url]);
  };

  const removeDocument = (url: string) => {
    setDocumentUrls((prev) => prev.filter((existing) => existing !== url));
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const income = Number(monthlyIncome.replace(/[^0-9.]/g, ""));
      await createCustomer({
        fullName: fullNameField.value.trim(),
        documentId: documentIdField.value.trim(),
        phone: phoneField.value.trim() || undefined,
        email: emailField.value.trim() || undefined,
        address: addressField.value.trim() || undefined,
        city: cityField.value.trim() || undefined,
        occupation: occupationField.value.trim() || undefined,
        monthlyIncome: Number.isFinite(income) && income > 0 ? income : undefined,
        avatarUrl: avatarUrl ?? undefined,
        documentUrls: documentUrls.length > 0 ? documentUrls : undefined,
      });
      router.back();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setSubmitError(t("customerForm.errors.duplicateDocument"));
      } else {
        setSubmitError(t("customerForm.errors.generic"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Icon family="Ionicons" name="close" size={24} color={colors.text} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AvatarPicker
            uri={avatarUrl}
            label={t("customerForm.photo.upload")}
            isUploading={avatarUpload.isUploading}
            onPress={handlePickAvatar}
          />

          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("customerForm.sections.personal")}
            </Text>
            <TextField
              label={t("customerForm.fields.fullName")}
              icon={<Icon family="Ionicons" name="person-outline" size={18} color={colors.textSecondary} />}
              value={fullNameField.value}
              onChangeText={fullNameField.setValue}
              onBlur={fullNameField.onBlur}
              placeholder={t("customerForm.placeholders.fullName")}
              errorMessage={fullNameField.errorKey ? translate(fullNameField.errorKey) : null}
            />
            <TextField
              label={t("customerForm.fields.documentId")}
              icon={<Icon family="Ionicons" name="card-outline" size={18} color={colors.textSecondary} />}
              value={documentIdField.value}
              onChangeText={documentIdField.setValue}
              onBlur={documentIdField.onBlur}
              placeholder={t("customerForm.placeholders.documentId")}
              errorMessage={documentIdField.errorKey ? translate(documentIdField.errorKey) : null}
            />
            <TextField
              label={t("customerForm.fields.phone")}
              icon={<Icon family="Ionicons" name="phone-portrait-outline" size={18} color={colors.textSecondary} />}
              value={phoneField.value}
              onChangeText={phoneField.setValue}
              placeholder={t("customerForm.placeholders.phone")}
              keyboardType="phone-pad"
            />
            <TextField
              label={t("customerForm.fields.email")}
              icon={<Icon family="Ionicons" name="mail-outline" size={18} color={colors.textSecondary} />}
              value={emailField.value}
              onChangeText={emailField.setValue}
              onBlur={emailField.onBlur}
              placeholder={t("customerForm.placeholders.email")}
              keyboardType="email-address"
              autoCapitalize="none"
              errorMessage={emailField.errorKey ? translate(emailField.errorKey) : null}
            />
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("customerForm.sections.address")}
            </Text>
            <TextField
              label={t("customerForm.fields.address")}
              icon={<Icon family="Ionicons" name="location-outline" size={18} color={colors.textSecondary} />}
              value={addressField.value}
              onChangeText={addressField.setValue}
              placeholder={t("customerForm.placeholders.address")}
            />
            <TextField
              label={t("customerForm.fields.city")}
              icon={<Icon family="Ionicons" name="business-outline" size={18} color={colors.textSecondary} />}
              value={cityField.value}
              onChangeText={cityField.setValue}
              placeholder={t("customerForm.placeholders.city")}
            />
          </Card>

          <Card style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("customerForm.sections.financial")}
              </Text>
              <Badge label={t("customerForm.optional")} tone="neutral" />
            </View>
            <TextField
              label={t("customerForm.fields.occupation")}
              icon={<Icon family="Ionicons" name="briefcase-outline" size={18} color={colors.textSecondary} />}
              value={occupationField.value}
              onChangeText={occupationField.setValue}
              placeholder={t("customerForm.placeholders.occupation")}
            />
            <TextField
              label={t("customerForm.fields.monthlyIncome")}
              icon={<Icon family="Ionicons" name="cash-outline" size={18} color={colors.textSecondary} />}
              value={monthlyIncome}
              onChangeText={setMonthlyIncome}
              placeholder={t("customerForm.placeholders.monthlyIncome")}
              keyboardType="decimal-pad"
            />
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("customerForm.sections.documents")}
            </Text>
            <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
              {t("customerForm.documentsDescription")}
            </Text>
            <View style={styles.documentButtons}>
              <IconActionButton
                label={t("customerForm.documents.scan")}
                icon={<Icon family="Ionicons" name="scan-outline" size={22} color={colors.primary} />}
                onPress={() => handleAddDocument("camera")}
                disabled={documentUpload.isUploading}
              />
              <IconActionButton
                label={t("customerForm.documents.gallery")}
                icon={<Icon family="Ionicons" name="images-outline" size={22} color={colors.primary} />}
                onPress={() => handleAddDocument("library")}
                disabled={documentUpload.isUploading}
              />
            </View>
            {documentUpload.isUploading ? (
              <ActivityIndicator color={colors.primary} style={styles.documentSpinner} />
            ) : null}
            {documentUrls.length > 0 ? (
              <View style={styles.thumbRow}>
                {documentUrls.map((url) => (
                  <View key={url} style={styles.thumbWrapper}>
                    <Image source={{ uri: url }} style={styles.thumb} contentFit="cover" />
                    <Pressable
                      onPress={() => removeDocument(url)}
                      style={[styles.thumbRemove, { backgroundColor: colors.danger }]}
                    >
                      <Icon family="Ionicons" name="close" size={12} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}
          </Card>

          {submitError ? (
            <Text style={[styles.submitError, { color: colors.danger }]}>{submitError}</Text>
          ) : null}

          <PrimaryButton
            label={t("customerForm.submit")}
            icon={<Icon family="Ionicons" name="checkmark-circle-outline" size={20} color={colors.onPrimary} />}
            onPress={handleSubmit}
            isLoading={isSubmitting}
            disabled={!canSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  sectionDescription: {
    fontSize: 13,
    marginTop: -8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  documentButtons: {
    flexDirection: "row",
    gap: 12,
  },
  documentSpinner: {
    marginTop: 4,
  },
  thumbRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
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
  submitError: {
    fontSize: 13,
    textAlign: "center",
  },
});
