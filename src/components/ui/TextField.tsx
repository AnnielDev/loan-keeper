import type { ReactNode } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type TextFieldProps = {
  label: string;
  icon?: ReactNode;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  errorMessage?: string | null;
  onBlur?: () => void;
  multiline?: boolean;
};

export function TextField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  errorMessage,
  onBlur,
  multiline,
}: TextFieldProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          { backgroundColor: colors.surface },
          multiline && styles.inputWrapperMultiline,
          errorMessage ? { borderWidth: 1, borderColor: colors.danger } : null,
        ]}
      >
        {icon}
        <TextInput
          style={[styles.input, { color: colors.text }, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={multiline ? 3 : undefined}
          textAlignVertical={multiline ? "top" : undefined}
        />
      </View>
      {errorMessage ? (
        <Text style={[styles.error, { color: colors.danger }]}>{errorMessage}</Text>
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
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputWrapperMultiline: {
    alignItems: "flex-start",
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  inputMultiline: {
    minHeight: 72,
  },
  error: {
    fontSize: 12,
  },
});
