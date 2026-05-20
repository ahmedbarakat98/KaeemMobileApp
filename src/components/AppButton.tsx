import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import { useI18n } from "@/lib/i18n";

type AppButtonVariant = "primary" | "secondary" | "danger" | "success" | "ghost";

type AppButtonProps = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: AppButtonVariant;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
} & Omit<PressableProps, "onPress" | "disabled" | "style">;

export function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  icon,
  style,
  ...props
}: AppButtonProps) {
  const { isArabic } = useI18n();

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        isArabic && styles.rowReverse,
        styles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "ghost" ? "#2563eb" : "#ffffff"} />
      ) : (
        <>
          {icon}

          <Text
            style={[
              styles.text,
              isArabic && styles.rtlText,
              variant === "secondary" && styles.secondaryText,
              variant === "ghost" && styles.ghostText,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  rowReverse: {
    flexDirection: "row-reverse",
  },

  primary: {
    backgroundColor: "#2563eb",
  },

  secondary: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },

  danger: {
    backgroundColor: "#dc2626",
  },

  success: {
    backgroundColor: "#16a34a",
  },

  ghost: {
    backgroundColor: "transparent",
  },

  disabled: {
    opacity: 0.6,
  },

  text: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },

  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },

  secondaryText: {
    color: "#334155",
  },

  ghostText: {
    color: "#2563eb",
  },
});