import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { useI18n } from "@/lib/i18n";

type AppInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  disabled?: boolean;
} & Omit<
  TextInputProps,
  | "value"
  | "onChangeText"
  | "placeholder"
  | "multiline"
  | "keyboardType"
  | "secureTextEntry"
  | "editable"
>;

export function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline = false,
  keyboardType = "default",
  secureTextEntry = false,
  disabled = false,
  ...props
}: AppInputProps) {
  const { isArabic } = useI18n();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, isArabic && styles.rtlText]}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        multiline={multiline}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={!disabled}
        textAlign={isArabic ? "right" : "left"}
        style={[
          styles.input,
          multiline && styles.textarea,
          isArabic && styles.rtlInput,
          error && styles.inputError,
          disabled && styles.disabled,
        ]}
        {...props}
      />

      {!!error && (
        <Text style={[styles.errorText, isArabic && styles.rtlText]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },

  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontSize: 14,
  },

  textarea: {
    minHeight: 90,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  inputError: {
    borderColor: "#dc2626",
  },

  disabled: {
    backgroundColor: "#f1f5f9",
    color: "#94a3b8",
  },

  errorText: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
  },

  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },

  rtlInput: {
    writingDirection: "rtl",
  },
});