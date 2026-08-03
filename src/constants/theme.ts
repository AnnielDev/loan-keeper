export type ColorScheme = "light" | "dark";

export const Colors = {
  light: {
    background: "#FFFFFF",
    surface: "#F9FAFB",
    card: "#FFFFFF",
    text: "#111827",
    textSecondary: "#6B7280",
    border: "#D1D5DB",
    primary: "#0040A1",
    onPrimary: "#FFFFFF",
    danger: "#DC2626",
    tabBarBackground: "rgba(255, 255, 255, 0.92)",
    tabBarActive: "#0040A1",
    tabBarInactive: "#6B7280",
    tabPillActive: "rgba(0, 64, 161, 0.12)",
    statusBar: "dark" as const,
  },
  dark: {
    background: "#0B0F19",
    surface: "#111827",
    card: "#1F2937",
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
    border: "#374151",
    primary: "#2F7BFF",
    onPrimary: "#FFFFFF",
    danger: "#F87171",
    tabBarBackground: "rgba(17, 24, 39, 0.85)",
    tabBarActive: "#2F7BFF",
    tabBarInactive: "#9CA3AF",
    tabPillActive: "rgba(47, 123, 255, 0.18)",
    statusBar: "light" as const,
  },
} satisfies Record<ColorScheme, Record<string, string> & { statusBar: "light" | "dark" }>;

export type ThemeColors = (typeof Colors)[ColorScheme];
