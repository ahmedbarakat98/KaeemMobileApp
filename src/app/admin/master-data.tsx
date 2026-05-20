import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  Database,
  Edit3,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
  X,
} from "lucide-react-native";

import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

const masterTables = [
  { key: "sales_reps" },
  { key: "regions" },
  { key: "districts" },
  { key: "sectors" },
  { key: "territories" },
  { key: "sales_teams" },
] as const;

type MasterTableKey = (typeof masterTables)[number]["key"];

type MasterItem = {
  id: string;
  name: string;
  code: string | null;
  created_at?: string;
};

export default function AdminMasterDataScreen() {
  const { user, isAdmin, loading } = useAuth();
  const { t, isArabic } = useI18n();

  const [activeTable, setActiveTable] = useState<MasterTableKey>("sales_reps");
  const [items, setItems] = useState<MasterItem[]>([]);
  const [busy, setBusy] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [editingItem, setEditingItem] = useState<MasterItem | null>(null);

  const tableLabels = useMemo<Record<MasterTableKey, string>>(
    () => ({
      sales_reps: isArabic ? "مندوبي المبيعات" : "Sales Reps",
      regions: isArabic ? "المناطق" : "Regions",
      districts: isArabic ? "الأحياء / الإدارات" : "Districts",
      sectors: isArabic ? "القطاعات" : "Sectors",
      territories: isArabic ? "النطاقات" : "Territories",
      sales_teams: isArabic ? "فرق المبيعات" : "Sales Teams",
    }),
    [isArabic]
  );

  const activeLabel = tableLabels[activeTable];

  const orderedMasterTables = useMemo(() => {
    return isArabic ? [...masterTables].reverse() : masterTables;
  }, [isArabic]);

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

  useEffect(() => {
    if (user && isAdmin) {
      resetForm();
      loadItems();
    }
  }, [activeTable, user, isAdmin]);

  async function loadItems() {
    try {
      setBusy(true);

      const { data, error } = await supabase
        .from(activeTable)
        .select("id, name, code, created_at")
        .order("name", { ascending: true });

      if (error) {
        Alert.alert(isArabic ? "خطأ في التحميل" : "Load Error", error.message);
        return;
      }

      setItems((data ?? []) as MasterItem[]);
    } catch {
      Alert.alert(
        t("error"),
        isArabic
          ? "تعذر تحميل البيانات الأساسية."
          : "Could not load master data."
      );
    } finally {
      setBusy(false);
      setRefreshing(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadItems();
  }

  function resetForm() {
    setName("");
    setCode("");
    setEditingItem(null);
  }

  function startEdit(item: MasterItem) {
    setEditingItem(item);
    setName(item.name);
    setCode(item.code ?? "");
  }

  async function saveItem() {
    const cleanName = name.trim();
    const cleanCode = code.trim();

    if (!cleanName) {
      Alert.alert(
        t("missingData"),
        isArabic ? "الاسم مطلوب." : "Name is required."
      );
      return;
    }

    setSaving(true);

    try {
      if (editingItem) {
        const { error } = await supabase
          .from(activeTable)
          .update({
            name: cleanName,
            code: cleanCode || null,
          })
          .eq("id", editingItem.id);

        if (error) {
          Alert.alert(isArabic ? "فشل التحديث" : "Update Failed", error.message);
          return;
        }

        Alert.alert(
          t("done"),
          isArabic ? "تم تحديث العنصر بنجاح." : "Item updated successfully."
        );
      } else {
        const { error } = await supabase.from(activeTable).insert({
          name: cleanName,
          code: cleanCode || null,
        });

        if (error) {
          Alert.alert(isArabic ? "فشل الإضافة" : "Add Failed", error.message);
          return;
        }

        Alert.alert(
          t("done"),
          isArabic ? "تمت إضافة العنصر بنجاح." : "Item added successfully."
        );
      }

      resetForm();
      await loadItems();
    } catch {
      Alert.alert(
        t("error"),
        isArabic
          ? "حدث خطأ أثناء الحفظ."
          : "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(item: MasterItem) {
    Alert.alert(
      isArabic ? "حذف العنصر" : "Delete Item",
      isArabic
        ? `هل أنت متأكد أنك تريد حذف "${item.name}"؟`
        : `Are you sure you want to delete "${item.name}"?`,
      [
        {
          text: t("cancel"),
          style: "cancel",
        },
        {
          text: t("delete"),
          style: "destructive",
          onPress: () => deleteItem(item),
        },
      ]
    );
  }

  async function deleteItem(item: MasterItem) {
    try {
      const { error } = await supabase
        .from(activeTable)
        .delete()
        .eq("id", item.id);

      if (error) {
        Alert.alert(isArabic ? "فشل الحذف" : "Delete Failed", error.message);
        return;
      }

      if (editingItem?.id === item.id) {
        resetForm();
      }

      await loadItems();

      Alert.alert(
        t("done"),
        isArabic ? "تم حذف العنصر بنجاح." : "Item deleted successfully."
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
          <Text style={styles.loadingText}>{t("loadingMasterData")}</Text>
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
          <View style={[styles.headerTextBox, isArabic && styles.alignRight]}>
            <Text style={[styles.pageTitle, isArabic && styles.rtlText]}>
              {t("masterData")}
            </Text>

            <Text style={[styles.pageSubtitle, isArabic && styles.rtlText]}>
              {isArabic
                ? "إدارة مندوبي المبيعات والمناطق والأحياء والفرق"
                : "Manage sales reps, regions, districts and teams"}
            </Text>
          </View>

          <Pressable style={styles.refreshButton} onPress={loadItems}>
            <RefreshCcw size={17} color="#ffffff" />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.tabsContent,
            isArabic && styles.rowReverse,
          ]}
          style={styles.tabs}
        >
          {orderedMasterTables.map((table) => {
            const active = table.key === activeTable;

            return (
              <Pressable
                key={table.key}
                style={[styles.tab, active && styles.activeTab]}
                onPress={() => setActiveTable(table.key)}
              >
                <Text style={[styles.tabText, active && styles.activeTabText]}>
                  {tableLabels[table.key]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.formCard}>
          <View style={[styles.formHeader, isArabic && styles.rowReverse]}>
            <View style={[styles.formHeaderLeft, isArabic && styles.rowReverse]}>
              <View style={styles.formIcon}>
                {editingItem ? (
                  <Edit3 size={18} color="#ffffff" />
                ) : (
                  <Plus size={18} color="#ffffff" />
                )}
              </View>

              <View style={isArabic && styles.alignRight}>
                <Text style={[styles.sectionTitle, isArabic && styles.rtlText]}>
                  {editingItem
                    ? isArabic
                      ? "تعديل عنصر"
                      : "Edit Item"
                    : isArabic
                      ? "إضافة عنصر جديد"
                      : "Add New Item"}
                </Text>

                <Text
                  style={[styles.sectionSubtitle, isArabic && styles.rtlText]}
                >
                  {activeLabel}
                </Text>
              </View>
            </View>

            {editingItem && (
              <Pressable style={styles.cancelEditButton} onPress={resetForm}>
                <X size={16} color="#64748b" />
              </Pressable>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isArabic && styles.rtlText]}>
              {isArabic ? "الاسم" : "Name"}
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={isArabic ? "أدخل الاسم" : "Enter name"}
              placeholderTextColor="#94a3b8"
              style={[styles.input, isArabic && styles.rtlInput]}
              textAlign={isArabic ? "right" : "left"}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isArabic && styles.rtlText]}>
              {isArabic ? "الكود" : "Code"}
            </Text>

            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder={isArabic ? "كود اختياري" : "Optional code"}
              placeholderTextColor="#94a3b8"
              style={[styles.input, isArabic && styles.rtlInput]}
              textAlign={isArabic ? "right" : "left"}
            />
          </View>

          <Pressable
            style={[
              styles.saveButton,
              isArabic && styles.rowReverseCenter,
              saving && styles.disabledButton,
            ]}
            onPress={saveItem}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Save size={18} color="#ffffff" />
                <Text style={styles.saveButtonText}>
                  {editingItem ? t("update") : t("add")}
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.listCard}>
          <View style={[styles.listHeader, isArabic && styles.rowReverse]}>
            <View style={isArabic && styles.alignRight}>
              <Text style={[styles.sectionTitle, isArabic && styles.rtlText]}>
                {activeLabel}
              </Text>

              <Text
                style={[styles.sectionSubtitle, isArabic && styles.rtlText]}
              >
                {isArabic
                  ? `${items.length} عنصر`
                  : `${items.length} item${items.length === 1 ? "" : "s"}`}
              </Text>
            </View>

            <Database size={22} color="#2563eb" />
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={[styles.emptyTitle, isArabic && styles.rtlText]}>
                {isArabic ? "لا توجد بيانات بعد" : "No data yet"}
              </Text>

              <Text style={[styles.emptyText, isArabic && styles.rtlText]}>
                {isArabic
                  ? "أضف أول عنصر باستخدام النموذج بالأعلى."
                  : "Add your first item using the form above."}
              </Text>
            </View>
          ) : (
            items.map((item) => (
              <View
                key={item.id}
                style={[styles.itemCard, isArabic && styles.rowReverse]}
              >
                <View style={styles.itemInfo}>
                  <Text
                    style={[styles.itemName, isArabic && styles.rtlText]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={[styles.itemCode, isArabic && styles.rtlText]}
                    numberOfLines={1}
                  >
                    {isArabic ? "الكود" : "Code"}: {item.code || "—"}
                  </Text>
                </View>

                <View style={[styles.itemActions, isArabic && styles.rowReverse]}>
                  <Pressable
                    style={styles.editButton}
                    onPress={() => startEdit(item)}
                  >
                    <Edit3 size={15} color="#2563eb" />
                  </Pressable>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => confirmDelete(item)}
                  >
                    <Trash2 size={15} color="#dc2626" />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </AppShell>
  );
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

  headerTextBox: {
    flex: 1,
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
    maxWidth: 240,
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },

  tabs: {
    marginBottom: 14,
  },

  tabsContent: {
    gap: 8,
  },

  tab: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },

  activeTab: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },

  tabText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "800",
  },

  activeTabText: {
    color: "#ffffff",
  },

  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  formHeader: {
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  formHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  formIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelEditButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    color: "#0f172a",
    fontSize: 17,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },

  inputGroup: {
    marginBottom: 12,
  },

  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontSize: 14,
  },

  saveButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },

  saveButtonText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 15,
  },

  disabledButton: {
    opacity: 0.65,
  },

  listCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  listHeader: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  emptyBox: {
    paddingVertical: 30,
    alignItems: "center",
  },

  emptyTitle: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "900",
  },

  emptyText: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },

  itemCard: {
    minHeight: 70,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  itemInfo: {
    flex: 1,
  },

  itemName: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "900",
  },

  itemCode: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 5,
  },

  itemActions: {
    flexDirection: "row",
    gap: 8,
  },

  editButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
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

  alignRight: {
    alignItems: "flex-end",
  },
});