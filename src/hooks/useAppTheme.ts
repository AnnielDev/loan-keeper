import { useColorScheme } from "react-native";

import { Colors, type ColorScheme } from "@/constants/theme";
import { useThemeStore } from "@/store/theme";

export function useAppTheme() {
  const systemScheme = useColorScheme();
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  const scheme: ColorScheme =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

  return {
    mode,
    setMode,
    scheme,
    colors: Colors[scheme],
  };
}
