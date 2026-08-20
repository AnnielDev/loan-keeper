import { create } from "zustand";

type ApiAlertState = {
  visible: boolean;
  title: string;
  message: string;
  showApiAlert: (title: string, message: string) => void;
  hideApiAlert: () => void;
};

export const useApiAlertStore = create<ApiAlertState>((set) => ({
  visible: false,
  title: "",
  message: "",
  showApiAlert: (title, message) => set({ visible: true, title, message }),
  hideApiAlert: () => set({ visible: false }),
}));
