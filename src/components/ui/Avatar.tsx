import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type AvatarProps = {
  uri?: string | null;
  name: string;
  size?: number;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function Avatar({ uri, name, size = 44 }: AvatarProps) {
  const { colors } = useAppTheme();
  const dimensions = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={dimensions}
        contentFit="cover"
        accessibilityLabel={name}
      />
    );
  }

  return (
    <View style={[styles.fallback, dimensions, { backgroundColor: colors.primary }]}>
      <Text style={[styles.initials, { color: colors.onPrimary, fontSize: size * 0.4 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontWeight: "700",
  },
});
