import NetInfo from "@react-native-community/netinfo";
import { create } from "zustand";

import { setApiFailureReporter } from "@/services/api";
import { useAuthStore } from "@/store/auth";

// How long a disconnection must persist before we drop the local session.
// Short blips (elevators, network handoffs) shouldn't force a re-login.
const DISCONNECT_GRACE_MS = 12_000;

// How long the API must keep failing (unreachable or 5xx) before we drop the
// local session — mirrors the offline grace period above.
const API_FAILURE_GRACE_MS = 15_000;

type NetworkState = {
  isOffline: boolean;
  /** True right after an offline-triggered logout, until acknowledged (e.g. by the sign-in screen). */
  signedOutOffline: boolean;
  acknowledgeOfflineSignOut: () => void;
  /** True right after a repeated-API-failure logout, until acknowledged. */
  signedOutApiError: boolean;
  acknowledgeApiErrorSignOut: () => void;
};

export const useNetworkStore = create<NetworkState>((set) => ({
  isOffline: false,
  signedOutOffline: false,
  acknowledgeOfflineSignOut: () => set({ signedOutOffline: false }),
  signedOutApiError: false,
  acknowledgeApiErrorSignOut: () => set({ signedOutApiError: false }),
}));

let disconnectTimer: ReturnType<typeof setTimeout> | null = null;

NetInfo.addEventListener((state) => {
  const isOffline = state.isConnected === false || state.isInternetReachable === false;
  useNetworkStore.setState({ isOffline });

  if (isOffline) {
    if (disconnectTimer) return;
    disconnectTimer = setTimeout(() => {
      disconnectTimer = null;
      if (useAuthStore.getState().accessToken) {
        useAuthStore.getState().forceSignOut();
        useNetworkStore.setState({ signedOutOffline: true });
      }
    }, DISCONNECT_GRACE_MS);
  } else if (disconnectTimer) {
    clearTimeout(disconnectTimer);
    disconnectTimer = null;
  }
});

let apiFailureSince: number | null = null;

setApiFailureReporter((ok) => {
  if (ok) {
    apiFailureSince = null;
    return;
  }

  const now = Date.now();
  if (apiFailureSince === null) {
    apiFailureSince = now;
    return;
  }

  if (now - apiFailureSince >= API_FAILURE_GRACE_MS && useAuthStore.getState().accessToken) {
    useAuthStore.getState().forceSignOut();
    useNetworkStore.setState({ signedOutApiError: true });
    apiFailureSince = null;
  }
});
