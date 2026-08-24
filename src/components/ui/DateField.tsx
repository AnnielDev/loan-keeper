import {
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetMethods,
} from "@expo/ui/community/bottom-sheet";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/general/Icon";
import { useAppTheme } from "@/hooks/useAppTheme";

type DateFieldProps = {
  label: string;
  value: Date;
  displayValue: string;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  doneLabel?: string;
};

// Jetpack Compose's DatePicker always keys selection off UTC midnight for the
// chosen calendar day, so a plain local Date fed in/out of it drifts a day in
// timezones behind UTC. Map local Y-M-D <-> UTC Y-M-D at the boundary instead.
function toAndroidPickerDate(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function fromAndroidPickerDate(date: Date): Date {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function DateField({
  label,
  value,
  displayValue,
  onChange,
  minimumDate,
  maximumDate,
  doneLabel = "OK",
}: DateFieldProps) {
  const { colors } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);
  const sheetRef = useRef<BottomSheetMethods>(null);

  useEffect(() => {
    if (Platform.OS === "android") return;
    if (isOpen) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isOpen]);

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Pressable
        onPress={() => setIsOpen(true)}
        style={[
          styles.trigger,
          { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder },
        ]}
      >
        <Text style={[styles.value, { color: colors.text }]}>{displayValue}</Text>
        <Icon family="Ionicons" name="calendar-outline" size={18} color={colors.textSecondary} />
      </Pressable>

      {Platform.OS === "android" && isOpen ? (
        <DateTimePicker
          value={toAndroidPickerDate(value)}
          mode="date"
          minimumDate={minimumDate ? toAndroidPickerDate(minimumDate) : undefined}
          maximumDate={maximumDate ? toAndroidPickerDate(maximumDate) : undefined}
          onValueChange={(_, date) => {
            onChange(fromAndroidPickerDate(date));
            setIsOpen(false);
          }}
          onDismiss={() => setIsOpen(false)}
        />
      ) : null}

      {Platform.OS !== "android" ? (
        <BottomSheetModal
          ref={sheetRef}
          enableDynamicSizing
          enablePanDownToClose
          onDismiss={() => setIsOpen(false)}
          backgroundStyle={{ backgroundColor: colors.card }}
        >
          <BottomSheetView style={styles.sheetContent}>
            <DateTimePicker
              value={value}
              mode="date"
              display="inline"
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              onValueChange={(_, date) => onChange(date)}
            />
            <Pressable
              onPress={() => setIsOpen(false)}
              style={[styles.doneButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.doneLabel, { color: colors.onPrimary }]}>{doneLabel}</Text>
            </Pressable>
          </BottomSheetView>
        </BottomSheetModal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  value: {
    fontSize: 15,
  },
  sheetContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 16,
    alignItems: "stretch",
  },
  doneButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  doneLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
});
