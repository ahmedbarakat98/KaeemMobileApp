import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import {
  ClipboardList,
  Database,
  FileText,
  MapPin,
  RefreshCcw,
  Users,
} from "lucide-react-native";

import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { AppLoader } from "@/components/AppLoader";

type RecentSubmission = {
  id: string;
  customer_name: string;
  invoice_number: string;
  phone: string;
  region: string | null;
  sales_rep: string | null;
  created_at: string;
};

type Stats = {
  submissions: number;
  salesReps: number;
  regions: number;
  districts: number;
  sectors: number;
  territories: number;
  salesTeams: number;
};

const initialStats: Stats = {
  submissions: 0,
  salesReps: 0,
  regions: 0,
  districts: 0,
  sectors: 0,
  territories: 0,
  salesTeams: 0,
};

export default function AdminOverviewScreen() {
  const { user, isAdmin, loading } = useAuth();
  const { t, language, isArabic } = useI18n();

  const [stats, setStats] = useState<Stats>(initialStats);
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>(
    []
  );
  const [busy, setBusy] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
      return;
    }

    if (!loading && user && !isAdmin) {
      Alert.alert(t("accessDenied"), t("adminOnly"));
      router.replace("/");
    }
  }, [loading, user, isAdmin, t]);

  async function loadDashboard() {
    try {
      setBusy(true);

      const [
        submissionsRes,
        recentRes,
        salesRepsRes,
        regionsRes,
        districtsRes,
        sectorsRes,
        territoriesRes,
        salesTeamsRes,
      ] = await Promise.all([
        supabase.from("submissions").select("id", {
          count: "exact",
          head: true,
        }),

        supabase
          .from("submissions")
          .select(
            "id, customer_name, invoice_number, phone, region, sales_rep, created_at"
          )
          .order("created_at", { ascending: false })
          .limit(5),

        supabase.from("sales_reps").select("id", {
          count: "exact",
          head: true,
        }),

        supabase.from("regions").select("id", {
          count: "exact",
          head: true,
        }),

        supabase.from("districts").select("id", {
          count: "exact",
          head: true,
        }),

        supabase.from("sectors").select("id", {
          count: "exact",
          head: true,
        }),

        supabase.from("territories").select("id", {
          count: "exact",
          head: true,
        }),

        supabase.from("sales_teams").select("id", {
          count: "exact",
          head: true,
        }),
      ]);

      if (submissionsRes.error) throw submissionsRes.error;
      if (recentRes.error) throw recentRes.error;
      if (salesRepsRes.error) throw salesRepsRes.error;
      if (regionsRes.error) throw regionsRes.error;
      if (districtsRes.error) throw districtsRes.error;
      if (sectorsRes.error) throw sectorsRes.error;
      if (territoriesRes.error) throw territoriesRes.error;
      if (salesTeamsRes.error) throw salesTeamsRes.error;

      setStats({
        submissions: submissionsRes.count ?? 0,
        salesReps: salesRepsRes.count ?? 0,
        regions: regionsRes.count ?? 0,
        districts: districtsRes.count ?? 0,
        sectors: sectorsRes.count ?? 0,
        territories: territoriesRes.count ?? 0,
        salesTeams: salesTeamsRes.count ?? 0,
      });

      setRecentSubmissions((recentRes.data ?? []) as RecentSubmission[]);
    } catch (error: any) {
      Alert.alert(
        isArabic ? "خطأ في لوحة التحكم" : "Dashboard Error",
        error?.message ||
          (isArabic
            ? "تعذر تحميل بيانات لوحة التحكم."
            : "Could not load dashboard data.")
      );
    } finally {
      setBusy(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (user && isAdmin) {
        loadDashboard();
      }
    }, [user, isAdmin])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadDashboard();
  }

  if (loading || busy) {
    return (
      <AppShell>
        <View style={styles.loadingBox}>
          <AppLoader text={t("loadingDashboard")} />
          {/* <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>{t("loadingDashboard")}</Text> */}
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={[styles.headerCard, isArabic && styles.rowReverse]}>
          <View style={isArabic && styles.alignRight}>
            <Text style={[styles.pageTitle, isArabic && styles.rtlText]}>
              {t("adminDashboard")}
            </Text>

            <Text style={[styles.pageSubtitle, isArabic && styles.rtlText]}>
              {isArabic
                ? "نظرة عامة على الإدخالات والبيانات الأساسية"
                : "Overview for submissions and master data"}
            </Text>
          </View>

          <Pressable style={styles.refreshButton} onPress={loadDashboard}>
            <RefreshCcw size={17} color="#ffffff" />
          </Pressable>
        </View>

        <View style={[styles.statsGrid, isArabic && styles.rowReverse]}>
          <StatCard
            title={t("submissions")}
            value={stats.submissions}
            icon={ClipboardList}
            color="#2563eb"
            isArabic={isArabic}
          />

          <StatCard
            title={t("salesRep")}
            value={stats.salesReps}
            icon={Users}
            color="#16a34a"
            isArabic={isArabic}
          />

          <StatCard
            title={t("region")}
            value={stats.regions}
            icon={MapPin}
            color="#ea580c"
            isArabic={isArabic}
          />

          <StatCard
            title={isArabic ? "جداول البيانات" : "Master Tables"}
            value={
              stats.regions +
              stats.districts +
              stats.sectors +
              stats.territories +
              stats.salesTeams
            }
            icon={Database}
            color="#7c3aed"
            isArabic={isArabic}
          />
        </View>

        <View style={styles.actionsCard}>
          <Text style={[styles.sectionTitle, isArabic && styles.rtlText]}>
            {isArabic ? "إجراءات سريعة" : "Quick Actions"}
          </Text>

          <View style={styles.actionsGrid}>
            <ActionButton
              title={t("submissions")}
              subtitle={isArabic ? "عرض كل السجلات" : "View all records"}
              icon={ClipboardList}
              onPress={() => router.push("/admin/submissions")}
              isArabic={isArabic}
            />

            <ActionButton
              title={t("masterData")}
              subtitle={isArabic ? "إدارة القوائم" : "Manage lists"}
              icon={Database}
              onPress={() => router.push("/admin/master-data")}
              isArabic={isArabic}
            />

            <ActionButton
              title={t("salesForm")}
              subtitle={isArabic ? "إنشاء سجل جديد" : "Create record"}
              icon={FileText}
              onPress={() => router.push("/")}
              isArabic={isArabic}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={[styles.sectionHeader, isArabic && styles.rowReverse]}>
            <Text style={[styles.sectionTitle, isArabic && styles.rtlText]}>
              {isArabic ? "آخر الإدخالات" : "Recent Submissions"}
            </Text>

            <Pressable onPress={() => router.push("/admin/submissions")}>
              <Text style={styles.viewAllText}>
                {isArabic ? "عرض الكل" : "View all"}
              </Text>
            </Pressable>
          </View>

          {recentSubmissions.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={[styles.emptyText, isArabic && styles.rtlText]}>
                {isArabic ? "لا توجد إدخالات حتى الآن." : "No submissions yet."}
              </Text>
            </View>
          ) : (
            recentSubmissions.map((item) => (
              <View key={item.id} style={styles.submissionItem}>
                <View style={[styles.submissionTop, isArabic && styles.rowReverse]}>
                  <Text
                    style={[styles.customerName, isArabic && styles.rtlText]}
                    numberOfLines={1}
                  >
                    {item.customer_name}
                  </Text>

                  <Text style={styles.invoiceNumber} numberOfLines={1}>
                    #{item.invoice_number}
                  </Text>
                </View>

                <Text
                  style={[styles.submissionMeta, isArabic && styles.rtlText]}
                  numberOfLines={1}
                >
                  {t("phone")}: {item.phone}
                </Text>

                <Text
                  style={[styles.submissionMeta, isArabic && styles.rtlText]}
                  numberOfLines={1}
                >
                  {item.sales_rep ||
                    (isArabic ? "لا يوجد مندوب مبيعات" : "No sales rep")}{" "}
                  • {item.region || (isArabic ? "لا توجد منطقة" : "No region")}
                </Text>

                <Text style={[styles.submissionDate, isArabic && styles.rtlText]}>
                  {formatDate(item.created_at, language)}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.masterSummary}>
          <Text style={[styles.sectionTitle, isArabic && styles.rtlText]}>
            {isArabic ? "ملخص البيانات الأساسية" : "Master Data Summary"}
          </Text>

          <SummaryRow label={t("district")} value={stats.districts} isArabic={isArabic} />
          <SummaryRow label={t("sector")} value={stats.sectors} isArabic={isArabic} />
          <SummaryRow
            label={t("territory")}
            value={stats.territories}
            isArabic={isArabic}
          />
          <SummaryRow
            label={t("salesTeam")}
            value={stats.salesTeams}
            isArabic={isArabic}
          />
        </View>
      </ScrollView>
    </AppShell>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  isArabic,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  isArabic: boolean;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Icon size={20} color="#ffffff" />
      </View>

      <Text style={[styles.statValue, isArabic && styles.rtlText]}>
        {value}
      </Text>

      <Text style={[styles.statTitle, isArabic && styles.rtlText]}>
        {title}
      </Text>
    </View>
  );
}

function ActionButton({
  title,
  subtitle,
  icon: Icon,
  onPress,
  isArabic,
}: {
  title: string;
  subtitle: string;
  icon: any;
  onPress: () => void;
  isArabic: boolean;
}) {
  return (
    <Pressable
      style={[styles.actionButton, isArabic && styles.rowReverse]}
      onPress={onPress}
    >
      <View style={styles.actionIcon}>
        <Icon size={18} color="#2563eb" />
      </View>

      <View style={styles.actionTextBox}>
        <Text style={[styles.actionTitle, isArabic && styles.rtlText]}>
          {title}
        </Text>
        <Text style={[styles.actionSubtitle, isArabic && styles.rtlText]}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

function SummaryRow({
  label,
  value,
  isArabic,
}: {
  label: string;
  value: number;
  isArabic: boolean;
}) {
  return (
    <View style={[styles.summaryRow, isArabic && styles.rowReverse]}>
      <Text style={[styles.summaryLabel, isArabic && styles.rtlText]}>
        {label}
      </Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function formatDate(value: string, language: "en" | "ar") {
  try {
    const date = new Date(value);

    return date.toLocaleDateString(language === "ar" ? "ar-EG" : "en-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

const styles = StyleSheet.create({
  loadingBox: {
    minHeight: 400,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#475569",
    fontSize: 14,
  },

  headerCard: {
    backgroundColor: "#0f172a",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  pageTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
  },

  pageSubtitle: {
    color: "#cbd5e1",
    fontSize: 13,
    marginTop: 4,
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  statValue: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0f172a",
  },

  statTitle: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },

  actionsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  actionsGrid: {
    gap: 10,
    marginTop: 12,
  },

  actionButton: {
    minHeight: 64,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },

  actionTextBox: {
    flex: 1,
  },

  actionTitle: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "900",
  },

  actionSubtitle: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0f172a",
  },

  viewAllText: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "800",
  },

  emptyBox: {
    paddingVertical: 24,
    alignItems: "center",
  },

  emptyText: {
    color: "#64748b",
    fontSize: 14,
  },

  submissionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  submissionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },

  customerName: {
    flex: 1,
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "900",
  },

  invoiceNumber: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "800",
  },

  submissionMeta: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 5,
  },

  submissionDate: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 6,
  },

  masterSummary: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  summaryRow: {
    minHeight: 42,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  summaryLabel: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "700",
  },

  summaryValue: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "900",
  },

  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },

  rowReverse: {
    flexDirection: "row-reverse",
  },

  alignRight: {
    alignItems: "flex-end",
  },
});