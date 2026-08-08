import NetInfo from "@react-native-community/netinfo";
import { create } from "zustand";

import { useAuthStore } from "@/store/auth";

// How long a disconnection must persist before we drop the local session.
// Short blips (elevators, network handoffs) shouldn't force a re-login.
const DISCONNECT_GRACE_MS = 12_000;

type NetworkState = {
  isOffline: boolean;
  /** True right after an offline-triggered logout, until acknowledged (e.g. by the sign-in screen). */
  signedOutOffline: boolean;
  acknowledgeOfflineSignOut: () => void;
};

export const useNetworkStore = create<NetworkState>((set) => ({
  isOffline: false,
  signedOutOffline: false,
  acknowledgeOfflineSignOut: () => set({ signedOutOffline: false }),
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
