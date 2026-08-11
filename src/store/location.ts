import { AppState } from "react-native";
import { create } from "zustand";

import { getLocationAccessGranted } from "@/utils/deviceLocation";

// expo-location exposes no event for "permission or services toggled" —
// only a point-in-time check (getLocationAccessGranted). Toggling location
// from Android's quick-settings panel also doesn't background the app, so
// AppState alone won't catch it. Poll at this interval whenever the app is
// foregrounded; it's cheap (no native calls, just a status read) and stops
// the moment the app backgrounds.
const POLL_INTERVAL_MS = 3_000;

type LocationAccessState = {
  // Starts true so a fresh sign-in (no location granted yet) is gated purely
  // by the user's stored timezone, not by this check racing to resolve.
  isGranted: boolean;
  refresh: () => Promise<void>;
};

export const useLocationAccessStore = create<LocationAccessState>((set) => ({
  isGranted: true,
  refresh: async () => {
    const isGranted = await getLocationAccessGranted();
    set({ isGranted });
  },
}));

let pollTimer: ReturnType<typeof setInterval> | null = null;

function startPolling() {
  if (pollTimer) return;
  useLocationAccessStore.getState().refresh();
  pollTimer = setInterval(() => {
    useLocationAccessStore.getState().refresh();
  }, POLL_INTERVAL_MS);
}

function stopPolling() {
  if (!pollTimer) return;
  clearInterval(pollTimer);
  pollTimer = null;
}

if (AppState.currentState === "active") {
  startPolling();
}

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    startPolling();
  } else {
    stopPolling();
  }
});
