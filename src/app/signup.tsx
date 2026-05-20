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
import { UserPlus } from "lucide-react-native";

import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const { t, language, isArabic, toggleLanguage } = useI18n();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    if (!fullName.trim()) {
      Alert.alert(
        t("missingData"),
        isArabic ? "الاسم بالكامل مطلوب." : "Full name is required."
      );
      return;
    }

    if (!email.trim()) {
      Alert.alert(
        t("missingData"),
        isArabic ? "البريد الإلكتروني مطلوب." : "Email is required."
      );
      return;
    }

    if (!email.includes("@")) {
      Alert.alert(
        isArabic ? "بريد إلكتروني غير صحيح" : "Invalid Email",
        isArabic
          ? "من فضلك أدخل بريد إلكتروني صحيح."
          : "Please enter a valid email address."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        isArabic ? "كلمة مرور ضعيفة" : "Weak Password",
        isArabic
          ? "كلمة المرور يجب ألا تقل عن 6 أحرف."
          : "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        isArabic ? "خطأ في كلمة المرور" : "Password Error",
        isArabic ? "كلمتا المرور غير متطابقتين." : "Passwords do not match."
      );
      return;
    }

    setBusy(true);

    try {
      const { error } = await signUp(email, password, fullName);

      if (error) {
        Alert.alert(t("signUpFailed"), error.message);
        return;
      }

      Alert.alert(
        t("success"),
        t("accountCreated"),
        [
          {
            text: isArabic ? "الذهاب لتسجيل الدخول" : "Go to Login",
            onPress: () => router.replace("/auth"),
          },
        ]
      );
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
          <UserPlus size={32} color="#ffffff" />
        </View>

        <Text style={styles.title}>{t("createAccount")}</Text>

        <Text style={styles.subtitle}>
          {isArabic ? "أنشئ حساب لاستخدام التطبيق" : "Sign up to use the app"}
        </Text>

        <Text style={[styles.label, isArabic && styles.rtlText]}>
          {t("fullName")}
        </Text>

        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder={isArabic ? "أدخل الاسم بالكامل" : "Enter full name"}
          placeholderTextColor="#94a3b8"
          style={[styles.input, isArabic && styles.rtlInput]}
          textAlign={isArabic ? "right" : "left"}
        />

        <Text style={[styles.label, isArabic && styles.rtlText]}>
          {t("email")}
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
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

        <Text style={[styles.label, isArabic && styles.rtlText]}>
          {t("confirmPassword")}
        </Text>

        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={t("confirmPassword")}
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
            <Text style={styles.buttonText}>{t("createAccount")}</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.replace("/auth")}>
          <Text style={styles.loginText}>
            {t("haveAccount")} {t("signIn")}
          </Text>
        </Pressable>
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

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    color: "#0f172a",
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

  loginText: {
    marginTop: 16,
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },

  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },

  rtlInput: {
    writingDirection: "rtl",
  },
});