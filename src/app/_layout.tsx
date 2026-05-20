import { Stack } from "expo-router";
import { AuthProvider } from "@/hooks/useAuth";
import { I18nProvider } from "@/lib/i18n";

export default function RootLayout() {
  return (
    <I18nProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="index" />
          <Stack.Screen name="admin/index" />
          <Stack.Screen name="admin/submissions" />
          <Stack.Screen name="admin/master-data" />
        </Stack>
      </AuthProvider>
    </I18nProvider>
  );
}