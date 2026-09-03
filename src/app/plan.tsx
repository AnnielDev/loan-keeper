import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorCode, useIAP, type Purchase, type PurchaseError } from "react-native-iap";

import { Icon } from "@/components/general/Icon";
import { SUBSCRIPTION_PRODUCT_ID } from "@/constants/subscription";
import type { ThemeColors } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { verifyPurchase } from "@/services/subscription";
import { useAuthStore } from "@/store/auth";
import { usePlanIntroStore } from "@/store/planIntro";

function getDaysLeft(trialEndsAt: string) {
  const msLeft = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
}

export default function PlanScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const signOut = useAuthStore((state) => state.signOut);
  const hasSeenPlanIntro = usePlanIntroStore((state) =>
    user?._id ? state.seenUserIds.includes(user._id) : true,
  );
  const markPlanIntroSeen = usePlanIntroStore((state) => state.markSeen);

  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { connected, subscriptions, fetchProducts, requestPurchase, finishTransaction } = useIAP({
    onPurchaseSuccess: async (purchase: Purchase) => {
      const purchaseToken = purchase.purchaseToken;
      if (!purchaseToken) return;
      setIsVerifying(true);
      try {
        const { data } = await verifyPurchase({
          purchaseToken,
          productId: SUBSCRIPTION_PRODUCT_ID,
        });
        updateUser(data);
        await finishTransaction({ purchase, isConsumable: false });
      } catch {
        setError(t("plan.errors.verifyFailed"));
      } finally {
        setIsVerifying(false);
      }
    },
    onPurchaseError: (purchaseError: PurchaseError) => {
      if (purchaseError.code !== ErrorCode.UserCancelled) {
        setError(t("plan.errors.purchaseFailed"));
      }
    },
  });

  useEffect(() => {
    if (connected) {
      fetchProducts({ skus: [SUBSCRIPTION_PRODUCT_ID], type: "subs" });
    }
  }, [connected, fetchProducts]);

  const offerToken = subscriptions.find((subscription) => subscription.id === SUBSCRIPTION_PRODUCT_ID)
    ?.subscriptionOffers?.[0]?.offerTokenAndroid;

  const handleSubscribe = async () => {
    setError(null);
    if (!offerToken) {
      setError(t("plan.errors.purchaseFailed"));
      return;
    }
    try {
      await requestPurchase({
        request: {
          google: {
            skus: [SUBSCRIPTION_PRODUCT_ID],
            subscriptionOffers: [{ sku: SUBSCRIPTION_PRODUCT_ID, offerToken }],
          },
        },
        type: "subs",
      });
    } catch {
      setError(t("plan.errors.purchaseFailed"));
    }
  };

  const status = user?.subscriptionStatus;
  const isActive = status === "active";
  const daysLeft = user?.trialEndsAt ? getDaysLeft(user.trialEndsAt) : 0;
  const isTrialing = status === "trialing" && daysLeft > 0;
  const isPurchasing = isVerifying;
  const isFirstEntry = isTrialing && !hasSeenPlanIntro;
  const isEntitled = isActive || isTrialing;

  const handleContinue = () => {
    if (user?._id) markPlanIntroSeen(user._id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Icon
            family="Ionicons"
            name={isFirstEntry ? "gift-outline" : isActive ? "checkmark-circle-outline" : "star-outline"}
            size={40}
            color={colors.primary}
          />
        </View>

        <Text style={styles.title}>
          {isFirstEntry
            ? t("plan.welcome.title")
            : isActive
              ? t("plan.active.title")
              : isTrialing
                ? t("plan.trialing.title")
                : t("plan.expired.title")}
        </Text>

        <Text style={styles.description}>
          {isFirstEntry
            ? t("plan.welcome.subtitle", { count: daysLeft })
            : isActive
              ? t("plan.active.description")
              : isTrialing
                ? daysLeft > 0
                  ? t("plan.trialing.daysLeft", { count: daysLeft })
                  : t("plan.trialing.lastDay")
                : t("plan.expired.description")}
        </Text>

        {!isActive ? (
          <>
            <Text style={styles.price}>{t("plan.priceLabel")}</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {isFirstEntry ? (
              <TouchableOpacity style={styles.button} onPress={handleContinue}>
                <Text style={styles.buttonLabel}>{t("plan.continue")}</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[
                isFirstEntry ? styles.secondaryButton : styles.button,
                (isPurchasing || !offerToken) && styles.buttonDisabled,
              ]}
              onPress={handleSubscribe}
              disabled={isPurchasing || !offerToken}
            >
              {isPurchasing ? (
                <ActivityIndicator color={isFirstEntry ? colors.primary : colors.onPrimary} />
              ) : (
                <Text style={isFirstEntry ? styles.secondaryButtonLabel : styles.buttonLabel}>
                  {t("plan.subscribe")}
                </Text>
              )}
            </TouchableOpacity>
          </>
        ) : null}

        {!isEntitled ? (
          <TouchableOpacity onPress={() => signOut()}>
            <Text style={styles.signOutLink}>{t("appLock.signOut")}</Text>
          </TouchableOpacity>
        ) : null}
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
    iconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      marginBottom: 4,
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 8,
    },
    price: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      marginTop: 8,
    },
    error: {
      fontSize: 13,
      color: colors.danger,
      textAlign: "center",
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 32,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
      minWidth: 240,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonLabel: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: "700",
    },
    secondaryButton: {
      backgroundColor: "transparent",
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 32,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
      minWidth: 240,
    },
    secondaryButtonLabel: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "700",
    },
    signOutLink: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: "center",
      marginTop: 24,
    },
  });
