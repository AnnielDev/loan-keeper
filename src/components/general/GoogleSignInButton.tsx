import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import { Icon } from "@/components/general/Icon";
import type { ThemeColors } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { ApiError } from "@/services/api";
import { useAuthStore } from "@/store/auth";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_SIGNIN_CLIENT_ID,
});

type GoogleSignInButtonProps = {
  onError: (message: string) => void;
};

export function GoogleSignInButton({ onError }: GoogleSignInButtonProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handlePress = async () => {
    onError("");
    setIsSigningIn(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response) || !response.data.idToken) {
        return;
      }
      await signInWithGoogle({ idToken: response.data.idToken });
    } catch (err) {
      const isCancelled =
        isErrorWithCode(err) &&
        (err.code === statusCodes.SIGN_IN_CANCELLED || err.code === statusCodes.IN_PROGRESS);
      if (!isCancelled) {
        onError(err instanceof ApiError ? err.message : t("auth.errors.googleSignInFailed"));
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, isSigningIn && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={isSigningIn}
    >
      {isSigningIn ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <>
          <Icon family="Ionicons" name="logo-google" size={18} color={colors.text} />
          <Text style={styles.label}>{t("auth.continueWithGoogle")}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 12,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    label: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
  });
