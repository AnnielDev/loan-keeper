import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Icon } from "@/components/general/Icon";
import { useAppTheme } from "@/hooks/useAppTheme";

type SelectOption<T extends string> = {
  label: string;
  value: T;
};

type SelectProps<T extends string> = {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export function Select<T extends string>({
  options,
  value,
  onChange,
  isOpen,
  onOpen,
  onClose,
}: SelectProps<T>) {
  const { colors } = useAppTheme();
  const selected = options.find((option) => option.value === value);

  return (
    <>
      <Pressable
        onPress={onOpen}
        style={[
          styles.trigger,
          { borderColor: colors.border, backgroundColor: colors.card },
        ]}
      >
        <Text style={[styles.triggerLabel, { color: colors.text }]}>
          {selected?.label}
        </Text>
        <Icon
          family="Ionicons"
          name="chevron-down"
          size={16}
          color={colors.textSecondary}
        />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable
            style={[
              styles.sheet,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <ScrollView bounces={false}>
              {options.map((option) => {
                const isActive = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      onClose();
                    }}
                    style={[
                      styles.option,
                      isActive && { backgroundColor: colors.tabPillActive },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        { color: isActive ? colors.primary : colors.text },
                        isActive && styles.optionLabelActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {isActive && (
                      <Icon
                        family="Ionicons"
                        name="checkmark"
                        size={18}
                        color={colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    alignSelf: "flex-start",
    minWidth: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  triggerLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  sheet: {
    maxHeight: "60%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 12,
    paddingBottom: 28,
    paddingTop: 10,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  optionLabelActive: {
    fontWeight: "700",
  },
});
