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
import { supabase } from "@/lib/supabase";

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
      Alert.alert("Access denied", "Admin access only.");
      router.replace("/");
    }
  }, [loading, user, isAdmin]);

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
        "Dashboard Error",
        error?.message || "Could not load dashboard data."
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
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
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
        <View style={styles.headerCard}>
          <View>
            <Text style={styles.pageTitle}>Admin Dashboard</Text>
            <Text style={styles.pageSubtitle}>
              Overview for submissions and master data
            </Text>
          </View>

          <Pressable style={styles.refreshButton} onPress={loadDashboard}>
            <RefreshCcw size={17} color="#ffffff" />
          </Pressable>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Submissions"
            value={stats.submissions}
            icon={ClipboardList}
            color="#2563eb"
          />

          <StatCard
            title="Sales Reps"
            value={stats.salesReps}
            icon={Users}
            color="#16a34a"
          />

          <StatCard
            title="Regions"
            value={stats.regions}
            icon={MapPin}
            color="#ea580c"
          />

          <StatCard
            title="Master Tables"
            value={
              stats.regions +
              stats.districts +
              stats.sectors +
              stats.territories +
              stats.salesTeams
            }
            icon={Database}
            color="#7c3aed"
          />
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionsGrid}>
            <ActionButton
              title="Submissions"
              subtitle="View all records"
              icon={ClipboardList}
              onPress={() => router.push("/admin/submissions")}
            />

            <ActionButton
              title="Master Data"
              subtitle="Manage lists"
              icon={Database}
              onPress={() => router.push("/admin/master-data")}
            />

            <ActionButton
              title="Sales Form"
              subtitle="Create record"
              icon={FileText}
              onPress={() => router.push("/")}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Submissions</Text>

            <Pressable onPress={() => router.push("/admin/submissions")}>
              <Text style={styles.viewAllText}>View all</Text>
            </Pressable>
          </View>

          {recentSubmissions.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No submissions yet.</Text>
            </View>
          ) : (
            recentSubmissions.map((item) => (
              <View key={item.id} style={styles.submissionItem}>
                <View style={styles.submissionTop}>
                  <Text style={styles.customerName} numberOfLines={1}>
                    {item.customer_name}
                  </Text>

                  <Text style={styles.invoiceNumber} numberOfLines={1}>
                    #{item.invoice_number}
                  </Text>
                </View>

                <Text style={styles.submissionMeta} numberOfLines={1}>
                  Phone: {item.phone}
                </Text>

                <Text style={styles.submissionMeta} numberOfLines={1}>
                  {item.sales_rep || "No sales rep"} •{" "}
                  {item.region || "No region"}
                </Text>

                <Text style={styles.submissionDate}>
                  {formatDate(item.created_at)}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.masterSummary}>
          <Text style={styles.sectionTitle}>Master Data Summary</Text>

          <SummaryRow label="Districts" value={stats.districts} />
          <SummaryRow label="Sectors" value={stats.sectors} />
          <SummaryRow label="Territories" value={stats.territories} />
          <SummaryRow label="Sales Teams" value={stats.salesTeams} />
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
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Icon size={20} color="#ffffff" />
      </View>

      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

function ActionButton({
  title,
  subtitle,
  icon: Icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: any;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.actionButton} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Icon size={18} color="#2563eb" />
      </View>

      <View style={styles.actionTextBox}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function formatDate(value: string) {
  try {
    const date = new Date(value);

    return date.toLocaleDateString(undefined, {
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
});