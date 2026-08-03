import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import * as authService from "@/services/auth";
import type { SignInPayload, SignUpPayload, User } from "@/types/auth";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  isSubmitting: boolean;
  signIn: (payload: SignInPayload) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signOut: () => void;
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
          const data = await authService.signIn(payload);
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
          const data = await authService.signUp(payload);
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
      signOut: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: "loan-keeper.auth",
      storage: createJSONStorage(() => AsyncStorage),
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
