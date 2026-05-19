import { useEffect, useState } from "react";
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
import { supabase } from "@/lib/supabase";

const masterTables = [
  { key: "sales_reps", label: "Sales Reps" },
  { key: "regions", label: "Regions" },
  { key: "districts", label: "Districts" },
  { key: "sectors", label: "Sectors" },
  { key: "territories", label: "Territories" },
  { key: "sales_teams", label: "Sales Teams" },
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

  const [activeTable, setActiveTable] = useState<MasterTableKey>("sales_reps");
  const [items, setItems] = useState<MasterItem[]>([]);
  const [busy, setBusy] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [editingItem, setEditingItem] = useState<MasterItem | null>(null);

  const activeLabel =
    masterTables.find((table) => table.key === activeTable)?.label ||
    "Master Data";

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
        Alert.alert("Load Error", error.message);
        return;
      }

      setItems((data ?? []) as MasterItem[]);
    } catch {
      Alert.alert("Error", "Could not load master data.");
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
      Alert.alert("Missing Data", "Name is required.");
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
          Alert.alert("Update Failed", error.message);
          return;
        }

        Alert.alert("Done", "Item updated successfully.");
      } else {
        const { error } = await supabase.from(activeTable).insert({
          name: cleanName,
          code: cleanCode || null,
        });

        if (error) {
          Alert.alert("Add Failed", error.message);
          return;
        }

        Alert.alert("Done", "Item added successfully.");
      }

      resetForm();
      await loadItems();
    } catch {
      Alert.alert("Error", "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(item: MasterItem) {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${item.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
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
        Alert.alert("Delete Failed", error.message);
        return;
      }

      if (editingItem?.id === item.id) {
        resetForm();
      }

      await loadItems();
    } catch {
      Alert.alert("Error", "Something went wrong while deleting.");
    }
  }

  if (loading || busy) {
    return (
      <AppShell>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading master data...</Text>
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
            <Text style={styles.pageTitle}>Master Data</Text>
            <Text style={styles.pageSubtitle}>
              Manage sales reps, regions, districts and teams
            </Text>
          </View>

          <Pressable style={styles.refreshButton} onPress={loadItems}>
            <RefreshCcw size={17} color="#ffffff" />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
          style={styles.tabs}
        >
          {masterTables.map((table) => {
            const active = table.key === activeTable;

            return (
              <Pressable
                key={table.key}
                style={[styles.tab, active && styles.activeTab]}
                onPress={() => setActiveTable(table.key)}
              >
                <Text style={[styles.tabText, active && styles.activeTabText]}>
                  {table.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <View style={styles.formHeaderLeft}>
              <View style={styles.formIcon}>
                {editingItem ? (
                  <Edit3 size={18} color="#ffffff" />
                ) : (
                  <Plus size={18} color="#ffffff" />
                )}
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  {editingItem ? "Edit Item" : "Add New Item"}
                </Text>
                <Text style={styles.sectionSubtitle}>{activeLabel}</Text>
              </View>
            </View>

            {editingItem && (
              <Pressable style={styles.cancelEditButton} onPress={resetForm}>
                <X size={16} color="#64748b" />
              </Pressable>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              placeholderTextColor="#94a3b8"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Code</Text>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="Optional code"
              placeholderTextColor="#94a3b8"
              style={styles.input}
            />
          </View>

          <Pressable
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={saveItem}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Save size={18} color="#ffffff" />
                <Text style={styles.saveButtonText}>
                  {editingItem ? "Update" : "Add"}
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.sectionTitle}>{activeLabel}</Text>
              <Text style={styles.sectionSubtitle}>
                {items.length} item{items.length === 1 ? "" : "s"}
              </Text>
            </View>

            <Database size={22} color="#2563eb" />
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No data yet</Text>
              <Text style={styles.emptyText}>
                Add your first item using the form above.
              </Text>
            </View>
          ) : (
            items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>

                  <Text style={styles.itemCode} numberOfLines={1}>
                    Code: {item.code || "—"}
                  </Text>
                </View>

                <View style={styles.itemActions}>
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
});