import { ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, usePathname } from "expo-router";
import {
  ClipboardList,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
} from "lucide-react-native";

import { useAuth } from "@/hooks/useAuth";

type AppShellProps = {
  children: ReactNode;
};

const adminLinks = [
  {
    to: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/submissions",
    label: "Submissions",
    icon: ClipboardList,
  },
  {
    to: "/admin/master-data",
    label: "Master Data",
    icon: Database,
  },
  {
    to: "/",
    label: "Sales Form",
    icon: FileText,
  },
];

export function AppShell({ children }: AppShellProps) {
  const { user, isAdmin, signOut } = useAuth();
  const pathname = usePathname();

  async function handleSignOut() {
    await signOut();
    router.replace("/auth");
  }

  function goHome() {
    router.push(isAdmin ? "/admin" : "/");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.header}>
          <Pressable style={styles.brand} onPress={goHome}>
            <View style={styles.logoBox}>
              <MapPin size={20} color="#ffffff" />
            </View>

            <View>
              <Text style={styles.appName}>Fodica</Text>
              <Text style={styles.appTagline}>Field Sales System</Text>
            </View>
          </Pressable>

          {user && (
            <Pressable style={styles.signOutButton} onPress={handleSignOut}>
              <LogOut size={16} color="#334155" />
              <Text style={styles.signOutText}>Sign out</Text>
            </Pressable>
          )}
        </View>

        {isAdmin && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.navContent}
            style={styles.nav}
          >
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.to;

              return (
                <Pressable
                  key={link.to}
                  onPress={() => router.push(link.to as any)}
                  style={[styles.navItem, active && styles.navItemActive]}
                >
                  <Icon
                    size={15}
                    color={active ? "#ffffff" : "#64748b"}
                  />
                  <Text
                    style={[
                      styles.navText,
                      active && styles.navTextActive,
                    ]}
                  >
                    {link.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <ScrollView
          style={styles.main}
          contentContainerStyle={styles.mainContent}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  page: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  header: {
    minHeight: 64,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  appTagline: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 1,
  },
  signOutButton: {
    minHeight: 36,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  signOutText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  nav: {
    maxHeight: 52,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  navContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  navItem: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  navItemActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  navText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  navTextActive: {
    color: "#ffffff",
  },
  main: {
    flex: 1,
  },
  mainContent: {
    padding: 16,
    paddingBottom: 32,
  },
});