import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Check, ChevronsUpDown, Search, X } from "lucide-react-native";

export interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select option",
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(q)
    );
  }, [options, search]);

  function handleSelect(option: Option) {
    onChange(option.value);
    setOpen(false);
    setSearch("");
  }

  return (
    <>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.trigger, disabled && styles.disabled]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.triggerText,
            !selected && styles.placeholderText,
          ]}
        >
          {selected?.label ?? placeholder}
        </Text>

        <ChevronsUpDown size={18} color="#64748b" />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{placeholder}</Text>

              <Pressable
                onPress={() => setOpen(false)}
                style={styles.closeButton}
              >
                <X size={18} color="#64748b" />
              </Pressable>
            </View>

            <View style={styles.searchBox}>
              <Search size={18} color="#94a3b8" />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search..."
                placeholderTextColor="#94a3b8"
                style={styles.searchInput}
                autoCapitalize="none"
              />
            </View>

            {filteredOptions.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            ) : (
              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item.value}
                keyboardShouldPersistTaps="handled"
                style={styles.list}
                renderItem={({ item }) => {
                  const active = item.value === value;

                  return (
                    <Pressable
                      onPress={() => handleSelect(item)}
                      style={[
                        styles.optionItem,
                        active && styles.optionItemActive,
                      ]}
                    >
                      <View style={styles.checkBox}>
                        {active && <Check size={16} color="#2563eb" />}
                      </View>

                      <Text
                        numberOfLines={1}
                        style={[
                          styles.optionText,
                          active && styles.optionTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  triggerText: {
    flex: 1,
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "600",
  },
  placeholderText: {
    color: "#94a3b8",
    fontWeight: "500",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    maxHeight: "75%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 14,
  },
  modalHeader: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    color: "#0f172a",
    fontSize: 17,
    fontWeight: "900",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    height: 46,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 13,
    paddingHorizontal: 12,
    marginTop: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#0f172a",
    fontSize: 14,
  },
  list: {
    maxHeight: 360,
  },
  optionItem: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionItemActive: {
    backgroundColor: "#eff6ff",
  },
  checkBox: {
    width: 22,
    alignItems: "center",
  },
  optionText: {
    flex: 1,
    color: "#334155",
    fontSize: 14,
    fontWeight: "600",
  },
  optionTextActive: {
    color: "#2563eb",
    fontWeight: "900",
  },
  emptyBox: {
    paddingVertical: 30,
    alignItems: "center",
  },
  emptyText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "600",
  },
});