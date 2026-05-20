import { Pressable, StyleSheet, Text } from "react-native";
import { useI18n } from "@/lib/i18n";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useI18n();

  return (
    <Pressable onPress={toggleLanguage} style={styles.button}>
      <Text style={styles.text}>
        {language === "en" ? "العربية" : "English"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-end",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 10,
  },
  text: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "900",
  },
});