import { type ReactNode, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Swipeable, { type SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";

import { Icon } from "@/components/general/Icon";
import { useAppTheme } from "@/hooks/useAppTheme";

type SwipeToDeleteProps = {
  children: ReactNode;
  onDelete: () => void;
  actionLabel: string;
};

type DeleteActionProps = {
  progress: SharedValue<number>;
  color: string;
  label: string;
  onPress: () => void;
};

function DeleteAction({ progress, color, label, onPress }: DeleteActionProps) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.6, 1], [0, 0.7, 1], "clamp"),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.5, 1], "clamp") }],
  }));

  return (
    <View style={styles.action}>
      <Pressable onPress={onPress} hitSlop={8}>
        {({ pressed }) => (
          <Animated.View
            style={[styles.panel, { backgroundColor: color, opacity: pressed ? 0.85 : 1 }, style]}
          >
            <View style={styles.iconBadge}>
              <Icon family="Ionicons" name="trash-outline" size={18} color={color} />
            </View>
            <Text style={styles.actionLabel}>{label}</Text>
          </Animated.View>
        )}
      </Pressable>
    </View>
  );
}

export function SwipeToDelete({ children, onDelete, actionLabel }: SwipeToDeleteProps) {
  const { colors } = useAppTheme();
  const swipeableRef = useRef<SwipeableMethods>(null);

  const handlePress = () => {
    swipeableRef.current?.close();
    onDelete();
  };

  return (
    <Swipeable
      ref={swipeableRef}
      leftThreshold={40}
      overshootLeft={false}
      renderLeftActions={(progress) => (
        <DeleteAction progress={progress} color={colors.danger} label={actionLabel} onPress={handlePress} />
      )}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  action: {
    width: 96,
    justifyContent: "center",
    alignItems: "center",
  },
  panel: {
    width: 80,
    paddingVertical: 18,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
