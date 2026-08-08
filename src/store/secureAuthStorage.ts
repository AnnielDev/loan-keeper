import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { PersistStorage, StorageValue } from "zustand/middleware";

import type { User } from "@/types/auth";

type AuthPersistedState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
};

// SecureStore (Keychain/Keystore) isn't available on web, so tokens fall back
// to AsyncStorage there — still gated behind the same key split as native.
const isNative = Platform.OS !== "web";

function getToken(key: string): Promise<string | null> {
  return isNative ? SecureStore.getItemAsync(key) : AsyncStorage.getItem(key);
}

function setToken(key: string, value: string | null): Promise<void> {
  if (value == null) {
    return isNative ? SecureStore.deleteItemAsync(key) : AsyncStorage.removeItem(key);
  }
  return isNative ? SecureStore.setItemAsync(key, value) : AsyncStorage.setItem(key, value);
}

// Splits the Zustand-persisted auth blob: access/refresh tokens go into
// SecureStore (hardware-backed on native), while the non-sensitive user
// profile stays in AsyncStorage like before.
export const secureAuthStorage: PersistStorage<AuthPersistedState> = {
  getItem: async (name) => {
    const [raw, accessToken, refreshToken] = await Promise.all([
      AsyncStorage.getItem(name),
      getToken("accessToken"),
      getToken("refreshToken"),
    ]);

    if (!raw) {
      if (!accessToken && !refreshToken) return null;
      return { state: { user: null, accessToken, refreshToken }, version: 0 };
    }

    const parsed = JSON.parse(raw) as StorageValue<AuthPersistedState>;
    return { ...parsed, state: { ...parsed.state, accessToken, refreshToken } };
  },
  setItem: async (name, value) => {
    const { accessToken, refreshToken, ...restState } = value.state;
    await Promise.all([
      AsyncStorage.setItem(name, JSON.stringify({ ...value, state: restState })),
      setToken("accessToken", accessToken ?? null),
      setToken("refreshToken", refreshToken ?? null),
    ]);
  },
  removeItem: async (name) => {
    await Promise.all([
      AsyncStorage.removeItem(name),
      setToken("accessToken", null),
      setToken("refreshToken", null),
    ]);
  },
};
