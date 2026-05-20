import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { MapPin } from "lucide-react-native";

import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";

export default function AuthScreen() {
  const { signIn } = useAuth();
  const { t, language, isArabic, toggleLanguage } = useI18n();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    if (!usernameOrEmail.trim()) {
      Alert.alert(
        t("error"),
        isArabic
          ? "اسم المستخدم أو البريد الإلكتروني مطلوب."
          : "Username or email is required."
      );
      return;
    }

    if (!password.trim()) {
      Alert.alert(
        t("error"),
        isArabic ? "كلمة المرور مطلوبة." : "Password is required."
      );
      return;
    }

    setBusy(true);

    try {
      const result = await signIn(usernameOrEmail, password);

      if (result.error) {
        Alert.alert(t("loginFailed"), result.error.message);
        return;
      }

      router.replace("/");
    } catch {
      Alert.alert(
        t("error"),
        isArabic ? "حدث خطأ غير متوقع." : "Something went wrong."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Pressable onPress={toggleLanguage} style={styles.languageButton}>
          <Text style={styles.languageButtonText}>
            {language === "en" ? "العربية" : "English"}
          </Text>
        </Pressable>

        <View style={styles.logo}>
          <MapPin size={32} color="#ffffff" />
        </View>

        <Text style={styles.title}>{t("appName")}</Text>

        <Text style={styles.subtitle}>{t("welcomeBack")}</Text>

        <Text style={[styles.label, isArabic && styles.rtlText]}>
          {t("usernameOrEmail")}
        </Text>

        <TextInput
          value={usernameOrEmail}
          onChangeText={setUsernameOrEmail}
          placeholder="email@example.com"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          style={[styles.input, isArabic && styles.rtlInput]}
          textAlign={isArabic ? "right" : "left"}
        />

        <Text style={[styles.label, isArabic && styles.rtlText]}>
          {t("password")}
        </Text>

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder={t("password")}
          placeholderTextColor="#94a3b8"
          secureTextEntry
          style={[styles.input, isArabic && styles.rtlInput]}
          textAlign={isArabic ? "right" : "left"}
        />

        <Pressable
          onPress={onSubmit}
          disabled={busy}
          style={[styles.button, busy && styles.disabled]}
        >
          {busy ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>{t("signIn")}</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push("/signup")}
          style={styles.signupButton}
        >
          <Text style={styles.signupText}>
            {t("noAccount")} {t("createAccount")}
          </Text>
        </Pressable>

        <Text style={styles.hint}>{t("adminLoginHint")}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
  },

  languageButton: {
    alignSelf: "flex-end",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 10,
  },

  languageButtonText: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "900",
  },

  logo: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 22,
  },

  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 6,
  },

  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    color: "#0f172a",
  },

  rtlInput: {
    writingDirection: "rtl",
  },

  button: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  disabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },

  signupButton: {
    marginTop: 16,
    alignItems: "center",
  },

  signupText: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },

  hint: {
    marginTop: 14,
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
  },
});