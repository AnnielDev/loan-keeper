import { Image } from "expo-image";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/general/Icon";
import { useAppTheme } from "@/hooks/useAppTheme";

type AvatarPickerProps = {
  uri: string | null;
  label: string;
  isUploading?: boolean;
  onPress: () => void;
};

const SIZE = 96;

export function AvatarPicker({ uri, label, isUploading, onPress }: AvatarPickerProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable onPress={onPress} disabled={isUploading} style={styles.container}>
      <View style={[styles.circle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {uri ? (
          <Image source={{ uri }} style={styles.image} contentFit="cover" />
        ) : (
          <Icon family="Ionicons" name="camera-outline" size={28} color={colors.textSecondary} />
        )}
        {isUploading ? (
          <View style={styles.overlay}>
            <ActivityIndicator color="#FFFFFF" />
          </View>
        ) : null}
        <View
          style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.background }]}
        >
          <Icon family="Ionicons" name="add" size={14} color={colors.onPrimary} />
        </View>
      </View>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
