import { Pressable, StyleSheet } from "react-native";

import { Icon } from "@/components/general/Icon";
import { useAppTheme } from "@/hooks/useAppTheme";

type CheckboxProps = {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export function Checkbox({ checked, onToggle, disabled }: CheckboxProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      hitSlop={8}
      style={styles.pressable}
    >
      <Icon
        family="Ionicons"
        name={checked ? "checkbox" : "square-outline"}
        size={22}
        color={checked ? colors.primary : colors.border}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignItems: "center",
    justifyContent: "center",
  },
});
