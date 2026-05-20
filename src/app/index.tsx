import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Location from "expo-location";
import * as Device from "expo-device";
import { MapPin, Send, Shield } from "lucide-react-native";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";

type FormState = {
  customerName: string;
  invoiceNumber: string;
  address: string;
  phone: string;
  salesRep: string;
  region: string;
  district: string;
  sector: string;
  territory: string;
  salesTeam: string;
  notes: string;
};

const initialForm: FormState = {
  customerName: "",
  invoiceNumber: "",
  address: "",
  phone: "",
  salesRep: "",
  region: "",
  district: "",
  sector: "",
  territory: "",
  salesTeam: "",
  notes: "",
};

export default function HomeScreen() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { t, language, isArabic, toggleLanguage } = useI18n();

  const [form, setForm] = useState<FormState>(initialForm);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [loading, user]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function getCurrentLocation() {
    setGettingLocation(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          isArabic ? "إذن الموقع مطلوب" : "Location permission required",
          isArabic
            ? "من فضلك اسمح للتطبيق باستخدام الموقع لحفظ موقع العميل."
            : "Please allow location permission to save the customer location."
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);

      Alert.alert(
        t("done"),
        isArabic
          ? "تم تسجيل الموقع بنجاح."
          : "Location captured successfully."
      );
    } catch {
      Alert.alert(
        t("error"),
        isArabic
          ? "تعذر الحصول على الموقع الحالي."
          : "Could not get current location."
      );
    } finally {
      setGettingLocation(false);
    }
  }

  async function submitForm() {
    if (!user) {
      router.replace("/auth");
      return;
    }

    if (!form.customerName.trim()) {
      Alert.alert(
        t("missingData"),
        isArabic ? "اسم العميل مطلوب." : "Customer name is required."
      );
      return;
    }

    if (!form.invoiceNumber.trim()) {
      Alert.alert(
        t("missingData"),
        isArabic ? "رقم الفاتورة مطلوب." : "Invoice number is required."
      );
      return;
    }

    if (!form.address.trim()) {
      Alert.alert(
        t("missingData"),
        isArabic ? "العنوان مطلوب." : "Address is required."
      );
      return;
    }

    if (!form.phone.trim()) {
      Alert.alert(
        t("missingData"),
        isArabic ? "رقم الهاتف مطلوب." : "Phone is required."
      );
      return;
    }

    if (latitude === null || longitude === null) {
      Alert.alert(
        t("missingData"),
        isArabic
          ? "من فضلك قم بتسجيل موقع GPS أولًا."
          : "Please capture GPS location first."
      );
      return;
    }

    setSubmitting(true);

    try {
      const deviceInfo = [
        `platform=${Platform.OS}`,
        `brand=${Device.brand ?? "unknown"}`,
        `model=${Device.modelName ?? "unknown"}`,
        `device=${Device.deviceName ?? "unknown"}`,
      ].join("; ");

      const { error } = await supabase.from("submissions").insert({
        user_id: user.id,
        customer_name: form.customerName.trim(),
        invoice_number: form.invoiceNumber.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        latitude,
        longitude,
        sales_rep: form.salesRep.trim() || null,
        region: form.region.trim() || null,
        district: form.district.trim() || null,
        sector: form.sector.trim() || null,
        territory: form.territory.trim() || null,
        sales_team: form.salesTeam.trim() || null,
        device_info: deviceInfo,
        notes: form.notes.trim() || null,
      });

      if (error) {
        Alert.alert(
          isArabic ? "فشل الإرسال" : "Submit failed",
          error.message
        );
        return;
      }

      Alert.alert(
        t("success"),
        isArabic ? "تم حفظ البيانات بنجاح." : "Submission saved successfully."
      );

      setForm(initialForm);
      setLatitude(null);
      setLongitude(null);
    } catch {
      Alert.alert(
        t("error"),
        isArabic
          ? "حدث خطأ أثناء حفظ البيانات."
          : "Something went wrong while saving the form."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/auth");
  }

  if (loading || !user) {
    return (
      <SafeAreaView style={styles.centerPage}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>{t("loading")}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.header, isArabic && styles.rowReverse]}>
            <View style={isArabic && styles.alignRight}>
              <Text style={[styles.appName, isArabic && styles.rtlText]}>
                Fodica
              </Text>
              <Text style={[styles.subtitle, isArabic && styles.rtlText]}>
                {t("appTagline")}
              </Text>
            </View>

            <View style={styles.headerActions}>
              <Pressable
                onPress={toggleLanguage}
                style={styles.languageButton}
              >
                <Text style={styles.languageButtonText}>
                  {language === "en" ? "العربية" : "English"}
                </Text>
              </Pressable>

              <Pressable style={styles.signOutButton} onPress={handleSignOut}>
                <Text style={styles.signOutText}>{t("signOut")}</Text>
              </Pressable>
            </View>
          </View>

          {isAdmin && (
            <Pressable
              style={[styles.adminButton, isArabic && styles.rowReverseCenter]}
              onPress={() => router.push("/admin")}
            >
              <Shield size={18} color="#ffffff" />
              <Text style={styles.adminButtonText}>
                {t("openAdminDashboard")}
              </Text>
            </Pressable>
          )}

          <View style={styles.card}>
            <Text style={[styles.sectionTitle, isArabic && styles.rtlText]}>
              {t("customerDetails")}
            </Text>

            <AppInput
              label={t("customerName")}
              value={form.customerName}
              onChangeText={(value) => updateField("customerName", value)}
              placeholder={
                isArabic ? "أدخل اسم العميل" : "Enter customer name"
              }
              isArabic={isArabic}
            />

            <AppInput
              label={t("invoiceNumber")}
              value={form.invoiceNumber}
              onChangeText={(value) => updateField("invoiceNumber", value)}
              placeholder={
                isArabic ? "أدخل رقم الفاتورة" : "Enter invoice number"
              }
              isArabic={isArabic}
            />

            <AppInput
              label={t("phone")}
              value={form.phone}
              onChangeText={(value) => updateField("phone", value)}
              placeholder={
                isArabic ? "أدخل رقم الهاتف" : "Enter phone number"
              }
              keyboardType="phone-pad"
              isArabic={isArabic}
            />

            <AppInput
              label={t("address")}
              value={form.address}
              onChangeText={(value) => updateField("address", value)}
              placeholder={isArabic ? "أدخل العنوان" : "Enter address"}
              multiline
              isArabic={isArabic}
            />
          </View>

          <View style={styles.card}>
            <Text style={[styles.sectionTitle, isArabic && styles.rtlText]}>
              {t("salesData")}
            </Text>

            <AppInput
              label={t("salesRep")}
              value={form.salesRep}
              onChangeText={(value) => updateField("salesRep", value)}
              placeholder={t("salesRep")}
              isArabic={isArabic}
            />

            <AppInput
              label={t("region")}
              value={form.region}
              onChangeText={(value) => updateField("region", value)}
              placeholder={t("region")}
              isArabic={isArabic}
            />

            <AppInput
              label={t("district")}
              value={form.district}
              onChangeText={(value) => updateField("district", value)}
              placeholder={t("district")}
              isArabic={isArabic}
            />

            <AppInput
              label={t("sector")}
              value={form.sector}
              onChangeText={(value) => updateField("sector", value)}
              placeholder={t("sector")}
              isArabic={isArabic}
            />

            <AppInput
              label={t("territory")}
              value={form.territory}
              onChangeText={(value) => updateField("territory", value)}
              placeholder={t("territory")}
              isArabic={isArabic}
            />

            <AppInput
              label={t("salesTeam")}
              value={form.salesTeam}
              onChangeText={(value) => updateField("salesTeam", value)}
              placeholder={t("salesTeam")}
              isArabic={isArabic}
            />
          </View>

          <View style={styles.card}>
            <Text style={[styles.sectionTitle, isArabic && styles.rtlText]}>
              {t("gpsLocation")}
            </Text>

            <Pressable
              style={[
                styles.locationButton,
                isArabic && styles.rowReverseCenter,
              ]}
              onPress={getCurrentLocation}
              disabled={gettingLocation}
            >
              {gettingLocation ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <MapPin size={18} color="#ffffff" />
                  <Text style={styles.locationButtonText}>
                    {t("captureLocation")}
                  </Text>
                </>
              )}
            </Pressable>

            <View style={styles.locationBox}>
              <Text style={[styles.locationText, isArabic && styles.rtlText]}>
                {t("latitude")}: {latitude ?? t("notCaptured")}
              </Text>

              <Text style={[styles.locationText, isArabic && styles.rtlText]}>
                {t("longitude")}: {longitude ?? t("notCaptured")}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={[styles.sectionTitle, isArabic && styles.rtlText]}>
              {t("notes")}
            </Text>

            <AppInput
              label={t("notes")}
              value={form.notes}
              onChangeText={(value) => updateField("notes", value)}
              placeholder={isArabic ? "ملاحظات اختيارية" : "Optional notes"}
              multiline
              isArabic={isArabic}
            />
          </View>

          <Pressable
            style={[
              styles.submitButton,
              isArabic && styles.rowReverseCenter,
              submitting && styles.disabledButton,
            ]}
            onPress={submitForm}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Send size={18} color="#ffffff" />
                <Text style={styles.submitButtonText}>{t("submit")}</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  isArabic,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "phone-pad" | "numeric" | "email-address";
  multiline?: boolean;
  isArabic: boolean;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, isArabic && styles.rtlText]}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[
          styles.input,
          multiline && styles.textarea,
          isArabic && styles.rtlInput,
        ]}
        placeholderTextColor="#94a3b8"
        textAlign={isArabic ? "right" : "left"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  centerPage: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#475569",
    fontSize: 14,
  },

  header: {
    backgroundColor: "#0f172a",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  headerActions: {
    gap: 8,
    alignItems: "flex-end",
  },

  appName: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "800",
  },

  subtitle: {
    color: "#cbd5e1",
    fontSize: 13,
    marginTop: 3,
  },

  languageButton: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },

  languageButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 12,
  },

  signOutButton: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },

  signOutText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },

  adminButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#7c3aed",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },

  adminButtonText: {
    color: "#ffffff",
    fontWeight: "800",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 14,
  },

  inputGroup: {
    marginBottom: 12,
  },

  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
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
  },

  textarea: {
    minHeight: 90,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  locationButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  locationButtonText: {
    color: "#ffffff",
    fontWeight: "800",
  },

  locationBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  locationText: {
    color: "#475569",
    fontSize: 13,
    marginBottom: 4,
  },

  submitButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.65,
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