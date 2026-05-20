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
import { useI18n } from "@/lib/i18n";

type AppShellProps = {
  children: ReactNode;
};

const adminLinks = [
  {
    to: "/admin",
    labelKey: "overview",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/submissions",
    labelKey: "submissions",
    icon: ClipboardList,
  },
  {
    to: "/admin/master-data",
    labelKey: "masterData",
    icon: Database,
  },
  {
    to: "/",
    labelKey: "salesForm",
    icon: FileText,
  },
] as const;

export function AppShell({ children }: AppShellProps) {
  const { user, isAdmin, signOut } = useAuth();
  const { t, language, isArabic, toggleLanguage } = useI18n();

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
        <View style={[styles.header, isArabic && styles.rowReverse]}>
          <Pressable
            style={[styles.brand, isArabic && styles.rowReverse]}
            onPress={goHome}
          >
            <View style={styles.logoBox}>
              <MapPin size={20} color="#ffffff" />
            </View>

            <View style={isArabic && styles.alignRight}>
              <Text style={[styles.appName, isArabic && styles.rtlText]}>
                Fodica
              </Text>

              <Text style={[styles.appTagline, isArabic && styles.rtlText]}>
                {t("appTagline")}
              </Text>
            </View>
          </Pressable>

          <View style={[styles.headerActions, isArabic && styles.rowReverse]}>
            <Pressable style={styles.languageButton} onPress={toggleLanguage}>
              <Text style={styles.languageButtonText}>
                {language === "en" ? "العربية" : "English"}
              </Text>
            </Pressable>

            {user && (
              <Pressable
                style={[styles.signOutButton, isArabic && styles.rowReverse]}
                onPress={handleSignOut}
              >
                <LogOut size={16} color="#334155" />
                <Text style={styles.signOutText}>{t("signOut")}</Text>
              </Pressable>
            )}
          </View>
        </View>

        {isAdmin && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.navContent,
              isArabic && styles.rowReverse,
            ]}
            style={styles.nav}
          >
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.to;

              return (
                <Pressable
                  key={link.to}
                  onPress={() => router.push(link.to as any)}
                  style={[
                    styles.navItem,
                    isArabic && styles.rowReverse,
                    active && styles.navItemActive,
                  ]}
                >
                  <Icon size={15} color={active ? "#ffffff" : "#64748b"} />

                  <Text
                    style={[
                      styles.navText,
                      isArabic && styles.rtlText,
                      active && styles.navTextActive,
                    ]}
                  >
                    {t(link.labelKey)}
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
    gap: 12,
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
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

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  languageButton: {
    minHeight: 36,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    alignItems: "center",
    justifyContent: "center",
  },

  languageButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2563eb",
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

  rowReverse: {
    flexDirection: "row-reverse",
  },

  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },

  alignRight: {
    alignItems: "flex-end",
  },
});