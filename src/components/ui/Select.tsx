import {
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetMethods,
} from "@expo/ui/community/bottom-sheet";
import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

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
  const sheetRef = useRef<BottomSheetMethods>(null);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isOpen]);

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

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={["60%"]}
        enablePanDownToClose
        onDismiss={onClose}
        backgroundStyle={{ backgroundColor: colors.card }}
      >
        <BottomSheetScrollView
          bounces={false}
          contentContainerStyle={styles.list}
        >
          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  sheetRef.current?.dismiss();
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
        </BottomSheetScrollView>
      </BottomSheetModal>
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
  list: {
    paddingHorizontal: 12,
    paddingBottom: 24,
    paddingTop: 4,
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
