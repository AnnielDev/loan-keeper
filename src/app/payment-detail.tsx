import { Image } from "expo-image";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import type { TFunction } from "i18next";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/general/Icon";
import { Card } from "@/components/ui/Card";
import { InfoRow } from "@/components/ui/InfoRow";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useAppTheme } from "@/hooks/useAppTheme";
import { usePaymentDetail } from "@/hooks/usePaymentDetail";
import { useAuthStore } from "@/store/auth";
import type { PaymentDetail } from "@/types/loan";
import { formatCurrency, formatMediumDate } from "@/utils/format";

export default function PaymentDetailScreen() {
  const { loanId, installmentId } = useLocalSearchParams<{
    loanId: string;
    installmentId: string;
  }>();
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const currency = useAuthStore((state) => state.user?.currency ?? "USD");
  const { data, isLoading, error, refetch } = usePaymentDetail(loanId, installmentId);
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);

  const handleDownloadReceipt = async () => {
    if (!data) return;
    const html = buildReceiptHtml(data, currency, i18n.language, t);
    const { uri, base64 } = await Print.printToFileAsync({ html, base64: true });
    // Neither the new File/Directory API nor the legacy copyAsync can
    // reliably read the cache/Print/*.pdf file expo-print writes (throws
    // "Missing READ permission" / "isn't readable", at least under Expo
    // Go) — writing the base64 PDF content directly into a fresh file
    // under documentDirectory sidesteps touching that path altogether.
    const destination = FileSystem.documentDirectory
      ? `${FileSystem.documentDirectory}recibo-${data.installmentId}.pdf`
      : null;
    if (destination && base64) {
      await FileSystem.writeAsStringAsync(destination, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(destination ?? uri, {
          mimeType: "application/pdf",
          dialogTitle: t("paymentDetail.downloadReceipt"),
        });
      }
    } finally {
      // The share sheet has already read the file by the time shareAsync
      // resolves (or the share was skipped/cancelled) — delete our copy so
      // documentDirectory doesn't accumulate a PDF per payment forever.
      if (destination) {
        await FileSystem.deleteAsync(destination, { idempotent: true });
      }
    }
  };

  const handleShare = async () => {
    if (!data) return;
    await Share.share({
      message: t("paymentDetail.shareMessage", {
        amount: formatCurrency(data.paidAmount, currency, i18n.language),
        code: data.loanCode,
      }),
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{t("paymentDetail.errors.loadFailed")}</Text>
        <Pressable onPress={refetch} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
          <Text style={[styles.retryLabel, { color: colors.onPrimary }]}>{t("loanDetail.retry")}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!data) return null;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Icon family="Ionicons" name="chevron-back" size={26} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Icon family="Ionicons" name="checkmark-circle" size={64} color={colors.success} />
          <Text style={[styles.title, { color: colors.text }]}>{t("paymentDetail.title")}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t("paymentDetail.subtitle")}</Text>
        </View>

        <Card backgroundColor={colors.primary} style={styles.amountCard}>
          <Text style={styles.amountLabel}>{t("paymentDetail.amountLabel")}</Text>
          <Text style={styles.amountValue}>{formatCurrency(data.paidAmount, currency, i18n.language)}</Text>
        </Card>

        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("paymentDetail.sectionTitle")}</Text>
          <Card style={styles.infoCard}>
            <InfoRow
              icon={<Icon family="Ionicons" name="calendar-outline" size={18} color={colors.textSecondary} />}
              label={t("paymentDetail.fields.date")}
              value={data.paidAt ? formatMediumDate(data.paidAt, i18n.language) : t("paymentDetail.noReference")}
            />
            <InfoRow
              icon={<Icon family="Ionicons" name="card-outline" size={18} color={colors.textSecondary} />}
              label={t("paymentDetail.fields.method")}
              value={data.paymentMethod ? t(`paymentForm.methods.${data.paymentMethod}`) : t("paymentDetail.noReference")}
            />
            <InfoRow
              icon={<Icon family="Ionicons" name="pricetag-outline" size={18} color={colors.textSecondary} />}
              label={t("paymentDetail.fields.reference")}
              value={data.referenceNumber ?? t("paymentDetail.noReference")}
            />
          </Card>
        </View>

        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("paymentDetail.loanSummaryTitle")}</Text>
          <Card backgroundColor={colors.surface} style={styles.infoCard}>
            <View style={styles.loanHeader}>
              <View style={[styles.loanIconBadge, { backgroundColor: colors.successSurface }]}>
                <Icon family="Ionicons" name="cash-outline" size={20} color={colors.success} />
              </View>
              <View style={styles.loanHeaderText}>
                <Text style={[styles.loanType, { color: colors.text }]}>
                  {t(`paymentDetail.loanSummary.type.${data.loanType}`)}
                </Text>
                <Text style={[styles.customerName, { color: colors.textSecondary }]} numberOfLines={1}>
                  {data.customerName}
                </Text>
              </View>
            </View>

            <InfoRow
              icon={<Icon family="Ionicons" name="wallet-outline" size={18} color={colors.textSecondary} />}
              label={t("paymentDetail.loanSummary.principal")}
              value={formatCurrency(data.principalPortion, currency, i18n.language)}
            />
            <InfoRow
              icon={<Icon family="Ionicons" name="trending-up-outline" size={18} color={colors.textSecondary} />}
              label={t("paymentDetail.loanSummary.interest")}
              value={formatCurrency(data.interestPortion, currency, i18n.language)}
            />
          </Card>
        </View>

        {data.receiptUrl ? (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("paymentDetail.receiptTitle")}</Text>
            <Pressable onPress={() => setIsReceiptPreviewOpen(true)}>
              <Image source={{ uri: data.receiptUrl }} style={styles.receiptThumb} contentFit="cover" />
            </Pressable>
          </View>
        ) : null}

        <PrimaryButton
          label={t("paymentDetail.downloadReceipt")}
          icon={<Icon family="Ionicons" name="download-outline" size={20} color={colors.onPrimary} />}
          onPress={handleDownloadReceipt}
        />

        <Pressable onPress={handleShare} style={styles.shareButton}>
          <Icon family="Ionicons" name="share-social-outline" size={18} color={colors.primary} />
          <Text style={[styles.shareLabel, { color: colors.primary }]}>{t("paymentDetail.share")}</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={isReceiptPreviewOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsReceiptPreviewOpen(false)}
      >
        <Pressable style={styles.previewBackdrop} onPress={() => setIsReceiptPreviewOpen(false)}>
          {data.receiptUrl ? (
            <Image source={{ uri: data.receiptUrl }} style={styles.previewImage} contentFit="contain" />
          ) : null}
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildReceiptHtml(data: PaymentDetail, currency: string, locale: string, t: TFunction): string {
  const row = (icon: string, label: string, value: string) => `
    <div class="row">
      <div class="row-icon">${icon}</div>
      <div class="row-text">
        <p class="row-label">${escapeHtml(label)}</p>
        <p class="row-value">${escapeHtml(value)}</p>
      </div>
    </div>
  `;

  const dateValue = data.paidAt ? formatMediumDate(data.paidAt, locale) : t("paymentDetail.noReference");
  const methodValue = data.paymentMethod
    ? t(`paymentForm.methods.${data.paymentMethod}`)
    : t("paymentDetail.noReference");
  const referenceValue = data.referenceNumber ?? t("paymentDetail.noReference");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 32px 20px;
            background: #F3F4F6;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            color: #111827;
          }
          .receipt {
            max-width: 420px;
            margin: 0 auto;
            background: #FFFFFF;
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid #E5E7EB;
          }
          .header { text-align: center; padding: 32px 24px 20px; }
          .check {
            width: 56px;
            height: 56px;
            border-radius: 28px;
            background: #DCFCE7;
            color: #16A34A;
            font-size: 28px;
            font-weight: 700;
            line-height: 56px;
            margin: 0 auto 12px;
          }
          .title { font-size: 20px; font-weight: 700; margin: 0 0 4px; }
          .subtitle { font-size: 13px; color: #6B7280; margin: 0; }
          .amount-card {
            margin: 4px 24px 24px;
            background: #0040A1;
            border-radius: 18px;
            padding: 20px;
            text-align: center;
          }
          .amount-label {
            font-size: 12px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.75);
            margin: 0 0 4px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }
          .amount-value { font-size: 32px; font-weight: 700; color: #FFFFFF; margin: 0; }
          .section { margin: 0 24px 20px; }
          .section-title { font-size: 14px; font-weight: 700; margin: 0 0 8px; }
          .card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 4px 16px; }
          .card.surface { background: #F9FAFB; }
          .row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #F0F1F3; }
          .row:last-child { border-bottom: none; }
          .row-icon {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: #F3F4F6;
            text-align: center;
            line-height: 36px;
            font-size: 15px;
            flex-shrink: 0;
          }
          .row-text { flex: 1; min-width: 0; }
          .row-label { font-size: 11px; color: #6B7280; font-weight: 500; margin: 0 0 2px; }
          .row-value { font-size: 14px; font-weight: 600; margin: 0; }
          .loan-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 0;
            border-bottom: 1px solid #E5E7EB;
          }
          .loan-icon {
            width: 40px;
            height: 40px;
            border-radius: 20px;
            background: #DCFCE7;
            color: #16A34A;
            text-align: center;
            line-height: 40px;
            font-size: 17px;
            flex-shrink: 0;
          }
          .loan-type { font-size: 14px; font-weight: 700; margin: 0; }
          .loan-customer { font-size: 12px; color: #6B7280; margin: 2px 0 0; }
          .footer { text-align: center; padding: 4px 24px 28px; }
          .footer-code { font-size: 12px; color: #6B7280; margin: 0 0 2px; }
          .footer-brand {
            font-size: 11px;
            color: #9CA3AF;
            margin: 0;
            font-weight: 600;
            letter-spacing: 0.06em;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="check">&#10003;</div>
            <p class="title">${escapeHtml(t("paymentDetail.title"))}</p>
            <p class="subtitle">${escapeHtml(t("paymentDetail.subtitle"))}</p>
          </div>

          <div class="amount-card">
            <p class="amount-label">${escapeHtml(t("paymentDetail.amountLabel"))}</p>
            <p class="amount-value">${formatCurrency(data.paidAmount, currency, locale)}</p>
          </div>

          <div class="section">
            <p class="section-title">${escapeHtml(t("paymentDetail.sectionTitle"))}</p>
            <div class="card">
              ${row("&#128197;", t("paymentDetail.fields.date"), dateValue)}
              ${row("&#128179;", t("paymentDetail.fields.method"), methodValue)}
              ${row("&#127991;", t("paymentDetail.fields.reference"), referenceValue)}
            </div>
          </div>

          <div class="section">
            <p class="section-title">${escapeHtml(t("paymentDetail.loanSummaryTitle"))}</p>
            <div class="card surface">
              <div class="loan-header">
                <div class="loan-icon">&#128176;</div>
                <div>
                  <p class="loan-type">${escapeHtml(t(`paymentDetail.loanSummary.type.${data.loanType}`))}</p>
                  <p class="loan-customer">${escapeHtml(data.customerName)}</p>
                </div>
              </div>
              ${row("&#128188;", t("paymentDetail.loanSummary.principal"), formatCurrency(data.principalPortion, currency, locale))}
              ${row("&#128200;", t("paymentDetail.loanSummary.interest"), formatCurrency(data.interestPortion, currency, locale))}
            </div>
          </div>

          <div class="footer">
            <p class="footer-code">#${escapeHtml(data.loanCode)}</p>
            <p class="footer-brand">Loan Keeper</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
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
  header: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  amountCard: {
    alignItems: "center",
    gap: 6,
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.75)",
  },
  amountValue: {
    fontSize: 34,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  infoCard: {
    gap: 4,
  },
  loanHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 8,
  },
  loanIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loanHeaderText: {
    flex: 1,
    gap: 2,
  },
  loanType: {
    fontSize: 15,
    fontWeight: "700",
  },
  customerName: {
    fontSize: 13,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 4,
  },
  shareLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  receiptThumb: {
    width: 96,
    height: 96,
    borderRadius: 12,
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    width: "100%",
    height: "80%",
  },
});
