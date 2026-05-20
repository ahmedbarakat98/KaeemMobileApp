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

export default function AuthScreen() {
  const { signIn } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    if (!usernameOrEmail.trim()) {
      Alert.alert("Error", "Username or email is required.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Error", "Password is required.");
      return;
    }

    setBusy(true);

    try {
      const result = await signIn(usernameOrEmail, password);

      if (result.error) {
        Alert.alert("Login failed", result.error.message);
        return;
      }

      router.replace("/");
    } catch {
      Alert.alert("Error", "Something went wrong.");
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
        <View style={styles.logo}>
          <MapPin size={32} color="#ffffff" />
        </View>

        <Text style={styles.title}>Kaeem Mobile App</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <Text style={styles.label}>Username or Email</Text>
        <TextInput
          value={usernameOrEmail}
          onChangeText={setUsernameOrEmail}
          placeholder=" email@example.com"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          style={styles.input}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          style={styles.input}
        />

        <Pressable
          onPress={onSubmit}
          disabled={busy}
          style={[styles.button, busy && styles.disabled]}
        >
          {busy ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push("/signup")}
          style={styles.signupButton}
        >
          <Text style={styles.signupText}>
            Don't have an account? Create account
          </Text>
        </Pressable>

        <Text style={styles.hint}>Admin login: admin / admin</Text>
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