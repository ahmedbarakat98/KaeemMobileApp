import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useI18n } from "@/lib/i18n";

type AppLoaderProps = {
  text?: string;
};

export function AppLoader({ text }: AppLoaderProps) {
  const { t, isArabic } = useI18n();

  return (
    <View style={styles.loadingBox}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={[styles.loadingText, isArabic && styles.rtlText]}>
        {text || t("loading")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingBox: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#475569",
    fontSize: 14,
    fontWeight: "700",
  },

  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
});