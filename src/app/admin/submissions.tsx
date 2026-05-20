import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import {
  Calendar,
  FileText,
  MapPin,
  Phone,
  RefreshCcw,
  Search,
  Trash2,
  User,
} from "lucide-react-native";

import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

type Submission = {
  id: string;
  user_id: string;
  customer_name: string;
  invoice_number: string;
  address: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  sales_rep: string | null;
  region: string | null;
  district: string | null;
  sector: string | null;
  territory: string | null;
  sales_team: string | null;
  device_info: string | null;
  notes: string | null;
  created_at: string;
};

function formatDate(value: string, language: "en" | "ar") {
  try {
    return new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-EG", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function AdminSubmissionsScreen() {
  const { user, isAdmin, loading } = useAuth();
  const { t, language, isArabic } = useI18n();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [busy, setBusy] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

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

  async function loadSubmissions() {
    try {
      setBusy(true);

      const { data, error } = await supabase
        .from("submissions")
        .select(
          "id, user_id, customer_name, invoice_number, address, phone, latitude, longitude, sales_rep, region, district, sector, territory, sales_team, device_info, notes, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        Alert.alert(isArabic ? "خطأ في التحميل" : "Load Error", error.message);
        return;
      }

      setSubmissions((data ?? []) as Submission[]);
    } catch {
      Alert.alert(
        t("error"),
        isArabic ? "تعذر تحميل البيانات." : "Could not load submissions."
      );
    } finally {
      setBusy(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (user && isAdmin) {
        loadSubmissions();
      }
    }, [user, isAdmin])
  );

  const filteredSubmissions = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) return submissions;

    return submissions.filter((item) => {
      const searchableText = [
        item.customer_name,
        item.invoice_number,
        item.phone,
        item.address,
        item.sales_rep,
        item.region,
        item.district,
        item.sector,
        item.territory,
        item.sales_team,
        item.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [searchText, submissions]);

  async function onRefresh() {
    setRefreshing(true);
    await loadSubmissions();
  }

  async function openMap(item: Submission) {
    if (item.latitude === null || item.longitude === null) {
      Alert.alert(
        isArabic ? "لا يوجد موقع" : "No Location",
        isArabic
          ? "هذا الإدخال لا يحتوي على إحداثيات GPS."
          : "This submission does not include GPS coordinates."
      );
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      Alert.alert(
        t("error"),
        isArabic ? "تعذر فتح رابط الخريطة." : "Could not open map link."
      );
      return;
    }

    await Linking.openURL(url);
  }

  function confirmDelete(item: Submission) {
    Alert.alert(
      isArabic ? "حذف الإدخال" : "Delete Submission",
      isArabic
        ? `هل أنت متأكد أنك تريد حذف إدخال العميل "${item.customer_name}"؟`
        : `Are you sure you want to delete submission for "${item.customer_name}"?`,
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: () => deleteSubmission(item.id),
        },
      ]
    );
  }

  async function deleteSubmission(id: string) {
    try {
      const { error } = await supabase.from("submissions").delete().eq("id", id);

      if (error) {
        Alert.alert(isArabic ? "فشل الحذف" : "Delete Failed", error.message);
        return;
      }

      setSubmissions((current) => current.filter((item) => item.id !== id));

      Alert.alert(
        t("done"),
        isArabic ? "تم حذف الإدخال بنجاح." : "Submission deleted successfully."
      );
    } catch {
      Alert.alert(
        t("error"),
        isArabic
          ? "حدث خطأ أثناء الحذف."
          : "Something went wrong while deleting."
      );
    }
  }

  if (loading || busy) {
    return (
      <AppShell>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>
            {isArabic ? "جاري تحميل الإدخالات..." : "Loading submissions..."}
          </Text>
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
          <View style={[styles.headerTextBox, isArabic && styles.headerTextBoxRtl]}>
            <Text style={[styles.pageTitle, isArabic && styles.rtlText]}>
              {t("submissions")}
            </Text>

            <Text style={[styles.pageSubtitle, isArabic && styles.rtlText]}>
              {isArabic
                ? "مراجعة إدخالات العملاء ومواقع GPS وبيانات المبيعات"
                : "Review customer submissions, GPS locations and sales details"}
            </Text>
          </View>

          <Pressable style={styles.refreshButton} onPress={loadSubmissions}>
            <RefreshCcw size={17} color="#ffffff" />
          </Pressable>
        </View>

        <View style={[styles.summaryRow, isArabic && styles.rowReverse]}>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, isArabic && styles.rtlText]}>
              {submissions.length}
            </Text>
            <Text style={[styles.summaryLabel, isArabic && styles.rtlText]}>
              {isArabic ? "إجمالي الإدخالات" : "Total Submissions"}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, isArabic && styles.rtlText]}>
              {filteredSubmissions.length}
            </Text>
            <Text style={[styles.summaryLabel, isArabic && styles.rtlText]}>
              {isArabic ? "النتائج الظاهرة" : "Visible Results"}
            </Text>
          </View>
        </View>

        <View style={[styles.searchBox, isArabic && styles.rowReverse]}>
          <Search size={18} color="#64748b" />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder={
              isArabic
                ? "ابحث باسم العميل أو الفاتورة أو الهاتف أو المنطقة"
                : "Search by customer, invoice, phone or region"
            }
            placeholderTextColor="#94a3b8"
            style={[styles.searchInput, isArabic && styles.rtlInput]}
            textAlign={isArabic ? "right" : "left"}
          />
        </View>

        {filteredSubmissions.length === 0 ? (
          <View style={styles.emptyCard}>
            <FileText size={34} color="#94a3b8" />
            <Text style={[styles.emptyTitle, isArabic && styles.rtlText]}>
              {isArabic ? "لا توجد إدخالات" : "No submissions found"}
            </Text>
            <Text style={[styles.emptyText, isArabic && styles.rtlText]}>
              {isArabic
                ? "اسحب لأسفل للتحديث أو عدّل كلمات البحث."
                : "Pull down to refresh or adjust your search keywords."}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredSubmissions.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={[styles.cardHeader, isArabic && styles.rowReverse]}>
                  <View style={styles.cardTitleBox}>
                    <Text style={[styles.customerName, isArabic && styles.rtlText]}>
                      {item.customer_name}
                    </Text>
                    <Text style={[styles.invoiceText, isArabic && styles.rtlText]}>
                      {t("invoiceNumber")}: {item.invoice_number}
                    </Text>
                  </View>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => confirmDelete(item)}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </Pressable>
                </View>

                <View style={styles.infoGrid}>
                  <InfoRow
                    icon={Phone}
                    label={t("phone")}
                    value={item.phone}
                    isArabic={isArabic}
                  />

                  <InfoRow
                    icon={MapPin}
                    label={t("address")}
                    value={item.address}
                    isArabic={isArabic}
                  />

                  <InfoRow
                    icon={User}
                    label={t("salesRep")}
                    value={item.sales_rep || "-"}
                    isArabic={isArabic}
                  />

                  <InfoRow
                    icon={Calendar}
                    label={isArabic ? "تاريخ الإرسال" : "Submitted"}
                    value={formatDate(item.created_at, language)}
                    isArabic={isArabic}
                  />
                </View>

                <View style={[styles.tagsRow, isArabic && styles.rowReverse]}>
                  <Tag label={t("region")} value={item.region} isArabic={isArabic} />
                  <Tag label={t("district")} value={item.district} isArabic={isArabic} />
                  <Tag label={t("sector")} value={item.sector} isArabic={isArabic} />
                  <Tag label={t("territory")} value={item.territory} isArabic={isArabic} />
                  <Tag label={t("salesTeam")} value={item.sales_team} isArabic={isArabic} />
                </View>

                {!!item.notes && (
                  <View style={styles.notesBox}>
                    <Text style={[styles.notesLabel, isArabic && styles.rtlText]}>
                      {t("notes")}
                    </Text>
                    <Text style={[styles.notesText, isArabic && styles.rtlText]}>
                      {item.notes}
                    </Text>
                  </View>
                )}

                {!!item.device_info && (
                  <Text style={[styles.deviceText, isArabic && styles.rtlText]}>
                    {item.device_info}
                  </Text>
                )}

                <Pressable
                  style={[styles.mapButton, isArabic && styles.rowReverseCenter]}
                  onPress={() => openMap(item)}
                >
                  <MapPin size={16} color="#ffffff" />
                  <Text style={styles.mapButtonText}>
                    {isArabic ? "فتح موقع GPS" : "Open GPS Location"}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </AppShell>
  );
}

type InfoRowProps = {
  icon: typeof Phone;
  label: string;
  value: string;
  isArabic: boolean;
};

function InfoRow({ icon: Icon, label, value, isArabic }: InfoRowProps) {
  return (
    <View style={[styles.infoRow, isArabic && styles.rowReverse]}>
      <View style={styles.infoIcon}>
        <Icon size={15} color="#2563eb" />
      </View>

      <View style={styles.infoTextBox}>
        <Text style={[styles.infoLabel, isArabic && styles.rtlText]}>
          {label}
        </Text>
        <Text style={[styles.infoValue, isArabic && styles.rtlText]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

type TagProps = {
  label: string;
  value: string | null;
  isArabic: boolean;
};

function Tag({ label, value, isArabic }: TagProps) {
  if (!value) return null;

  return (
    <View style={styles.tag}>
      <Text style={[styles.tagLabel, isArabic && styles.rtlText]}>{label}</Text>
      <Text style={[styles.tagValue, isArabic && styles.rtlText]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingBox: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#64748b",
    fontWeight: "700",
  },

  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  headerTextBox: {
    flex: 1,
    paddingRight: 12,
  },

  headerTextBoxRtl: {
    paddingRight: 0,
    paddingLeft: 12,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
  },

  pageSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748b",
    lineHeight: 19,
  },

  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  summaryValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#2563eb",
  },

  summaryLabel: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b",
  },

  searchBox: {
    minHeight: 50,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  searchInput: {
    flex: 1,
    color: "#0f172a",
    fontSize: 14,
  },

  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
  },

  list: {
    gap: 12,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },

  cardTitleBox: {
    flex: 1,
  },

  customerName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },

  invoiceText: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b",
  },

  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    alignItems: "center",
    justifyContent: "center",
  },

  infoGrid: {
    gap: 8,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },

  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  infoTextBox: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#64748b",
    textTransform: "uppercase",
  },

  infoValue: {
    marginTop: 2,
    fontSize: 13,
    color: "#0f172a",
    lineHeight: 19,
    fontWeight: "700",
  },

  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },

  tag: {
    borderRadius: 999,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  tagLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#94a3b8",
    textTransform: "uppercase",
  },

  tagValue: {
    marginTop: 1,
    fontSize: 11,
    fontWeight: "900",
    color: "#334155",
  },

  notesBox: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 10,
  },

  notesLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#92400e",
    marginBottom: 3,
  },

  notesText: {
    fontSize: 13,
    color: "#78350f",
    lineHeight: 19,
  },

  deviceText: {
    marginTop: 10,
    fontSize: 11,
    color: "#94a3b8",
    lineHeight: 16,
  },

  mapButton: {
    marginTop: 12,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#16a34a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  mapButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },

  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },

  rtlInput: {
    writingDirection: "rtl",
  },

  rowReverse: {
    flexDirection: "row-reverse",
  },

  rowReverseCenter: {
    flexDirection: "row-reverse",
  },
});