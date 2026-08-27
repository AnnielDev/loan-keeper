import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Only the email is readable without a biometric prompt — just enough to
// decide whether to show the "sign in with Face ID / fingerprint" button and
// to know which account it applies to. The password itself is gated behind
// SecureStore's own `requireAuthentication`, so reading it always goes
// through the OS biometric/passcode prompt (Keychain biometryCurrentSet on
// iOS, a biometric-bound key in the Keystore on Android) — never just an
// app-level check.
const EMAIL_KEY = "loan-keeper.biometricLogin.email";
const PASSWORD_KEY = "loan-keeper.biometricLogin.password";

const isNative = Platform.OS !== "web";

export function canRememberCredential(): boolean {
  return isNative && SecureStore.canUseBiometricAuthentication();
}

export function getRememberedBiometricEmail(): Promise<string | null> {
  if (!isNative) return Promise.resolve(null);
  return AsyncStorage.getItem(EMAIL_KEY);
}

// Called right after a successful password sign-in. Silent on iOS when
// creating a new entry; both platforms may prompt when overwriting one
// (Android requires authentication for every SecureStore operation on a
// `requireAuthentication` item).
export async function rememberBiometricCredential(
  email: string,
  password: string,
  authenticationPrompt: string,
): Promise<void> {
  if (!canRememberCredential()) return;
  try {
    await SecureStore.setItemAsync(PASSWORD_KEY, password, {
      requireAuthentication: true,
      authenticationPrompt,
    });
    await AsyncStorage.setItem(EMAIL_KEY, email);
  } catch {
    // Best effort: the password-based session is already active regardless.
  }
}

export async function readBiometricCredential(
  authenticationPrompt: string,
): Promise<string | null> {
  if (!isNative) return null;
  try {
    return await SecureStore.getItemAsync(PASSWORD_KEY, {
      requireAuthentication: true,
      authenticationPrompt,
    });
  } catch {
    return null;
  }
}

export async function forgetBiometricCredential(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(PASSWORD_KEY).catch(() => {}),
    AsyncStorage.removeItem(EMAIL_KEY),
  ]);
}
