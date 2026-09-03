import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type PlanIntroState = {
  seenUserIds: string[];
  isHydrated: boolean;
  markSeen: (userId: string) => void;
};

export const usePlanIntroStore = create<PlanIntroState>()(
  persist(
    (set) => ({
      seenUserIds: [],
      isHydrated: false,
      markSeen: (userId) =>
        set((state) => ({
          seenUserIds: state.seenUserIds.includes(userId) ? state.seenUserIds : [...state.seenUserIds, userId],
        })),
    }),
    {
      name: "loan-keeper.planIntro",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        usePlanIntroStore.setState({ isHydrated: true });
      },
    },
  ),
);
