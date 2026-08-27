import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, type AppStateStatus } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { useAuthStore } from "@/store/auth";

// How long the app can sit in the background before returning to it
// requires re-authentication. Also applied at cold start (see
// onRehydrateStorage below), so force-quitting and reopening past this
// window locks the app too, not just simple backgrounding.
export const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

type AppLockState = {
  isLocked: boolean;
  biometricEnabled: boolean;
  isHydrated: boolean;
  lastBackgroundedAt: number | null;
  setBiometricEnabled: (enabled: boolean) => void;
  unlock: () => void;
};

export const useAppLockStore = create<AppLockState>()(
  persist(
    (set) => ({
      isLocked: false,
      biometricEnabled: false,
      isHydrated: false,
      lastBackgroundedAt: null,
      setBiometricEnabled: (enabled) => set({ biometricEnabled: enabled }),
      unlock: () => set({ isLocked: false, lastBackgroundedAt: null }),
    }),
    {
      name: "loan-keeper.appLock",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        biometricEnabled: state.biometricEnabled,
        lastBackgroundedAt: state.lastBackgroundedAt,
      }),
      // Deciding whether a stale `lastBackgroundedAt` should lock the app
      // also needs the auth store's hydration (see reconcileStaleLock
      // below) — the two rehydrate independently and may finish in either
      // order, so that check can't happen directly in this callback.
      onRehydrateStorage: () => () => {
        useAppLockStore.setState({ isHydrated: true });
      },
    },
  ),
);

// Cold-start reconciliation: a stale `lastBackgroundedAt` should lock the
// app, but that can only be decided once both this store and the auth store
// (which rehydrates independently from SecureStore) have finished loading —
// whichever hydrates second runs this synchronously, before RootLayout's
// combined `isHydrated` flag (gating first render) can turn true.
function reconcileStaleLock() {
  const authState = useAuthStore.getState();
  const lockState = useAppLockStore.getState();
  if (!authState.isHydrated || !lockState.isHydrated) return;

  if (
    authState.accessToken &&
    lockState.lastBackgroundedAt &&
    Date.now() - lockState.lastBackgroundedAt >= INACTIVITY_TIMEOUT_MS
  ) {
    useAppLockStore.setState({ isLocked: true });
  }
}

useAuthStore.subscribe(reconcileStaleLock);
useAppLockStore.subscribe(reconcileStaleLock);
reconcileStaleLock();

AppState.addEventListener("change", (nextState: AppStateStatus) => {
  if (!useAuthStore.getState().accessToken) return;

  if (nextState === "active") {
    const { lastBackgroundedAt } = useAppLockStore.getState();
    if (lastBackgroundedAt && Date.now() - lastBackgroundedAt >= INACTIVITY_TIMEOUT_MS) {
      useAppLockStore.setState({ isLocked: true });
    }
  } else {
    useAppLockStore.setState({ lastBackgroundedAt: Date.now() });
  }
});

// Clears any stale lock state across a sign-in or sign-out boundary (tracked
// via the presence of an access token, not its exact value — a background
// token refresh also changes the token but must NOT auto-unlock the app).
let wasAuthenticated = !!useAuthStore.getState().accessToken;
useAuthStore.subscribe((state) => {
  const isAuthenticated = !!state.accessToken;
  if (isAuthenticated !== wasAuthenticated) {
    wasAuthenticated = isAuthenticated;
    useAppLockStore.getState().unlock();
  }
});
