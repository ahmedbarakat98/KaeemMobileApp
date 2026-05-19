import { Stack } from "expo-router";
import { AuthProvider } from "@/hooks/useAuth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="index" />
        <Stack.Screen name="admin/index" />
        <Stack.Screen name="admin/submissions" />
        <Stack.Screen name="admin/master-data" />
      </Stack>
    </AuthProvider>
  );
}