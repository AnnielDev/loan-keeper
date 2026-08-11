import { create } from "zustand";
import { persist } from "zustand/middleware";

import * as authService from "@/services/auth";
import { setAuthAccessor } from "@/services/api";
import { secureAuthStorage } from "@/store/secureAuthStorage";
import type { SignInPayload, SignUpPayload, User } from "@/types/auth";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  isSubmitting: boolean;
  signIn: (payload: SignInPayload) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signOut: () => Promise<void>;
  /** Clears the session locally only — used when we can't reach the API (e.g. offline). */
  forceSignOut: () => void;
  /** Merges a partial User update (e.g. after a settings PATCH) into the stored session. */
  updateUser: (patch: Partial<User>) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isHydrated: false,
      isSubmitting: false,
      signIn: async (payload) => {
        set({ isSubmitting: true });
        try {
          const { data } = await authService.signIn(payload);
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isSubmitting: false,
          });
        } catch (error) {
          set({ isSubmitting: false });
          throw error;
        }
      },
      signUp: async (payload) => {
        set({ isSubmitting: true });
        try {
          await authService.signUp(payload);
          set({ isSubmitting: false });
        } catch (error) {
          set({ isSubmitting: false });
          throw error;
        }
      },
      signOut: async () => {
        try {
          await authService.logout();
        } catch {
          // Best effort: the session is being dropped locally regardless.
        } finally {
          set({ user: null, accessToken: null, refreshToken: null });
        }
      },
      forceSignOut: () => {
        set({ user: null, accessToken: null, refreshToken: null });
      },
      updateUser: (patch) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : state.user,
        }));
      },
    }),
    {
      name: "loan-keeper.auth",
      storage: secureAuthStorage,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ isHydrated: true });
      },
    },
  ),
);

setAuthAccessor({
  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  setTokens: (accessToken, refreshToken) => useAuthStore.setState({ accessToken, refreshToken }),
  clearAuth: () => useAuthStore.setState({ user: null, accessToken: null, refreshToken: null }),
});
