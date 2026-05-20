import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Language = "en" | "ar";

const STORAGE_KEY = "kaeem_language";

const translations = {
  en: {
    appName: "Kaeem Mobile App",
    appTagline: "Field Sales System",

    signIn: "Sign in",
    signUp: "Sign up",
    signOut: "Sign out",
    createAccount: "Create Account",
    welcomeBack: "Sign in to continue",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    fullName: "Full Name",
    email: "Email",
    usernameOrEmail: "Username or Email",
    password: "Password",
    confirmPassword: "Confirm Password",

    overview: "Overview",
    submissions: "Submissions",
    masterData: "Master Data",
    salesForm: "Sales Form",

    customerDetails: "Customer Details",
    customerName: "Customer Name",
    invoiceNumber: "Invoice Number",
    address: "Address",
    phone: "Phone",
    salesData: "Sales Data",
    salesRep: "Sales Rep",
    region: "Region",
    district: "District",
    sector: "Sector",
    territory: "Territory",
    salesTeam: "Sales Team",
    notes: "Notes",

    gpsLocation: "GPS Location",
    captureLocation: "Capture Current Location",
    latitude: "Latitude",
    longitude: "Longitude",
    notCaptured: "Not captured",

    submit: "Submit",
    save: "Save",
    add: "Add",
    update: "Update",
    delete: "Delete",
    cancel: "Cancel",
    edit: "Edit",
    refresh: "Refresh",

    selectOption: "Select option",
    searchPlaceholder: "Search...",
    noResults: "No results found",

    loading: "Loading...",
    loadingDashboard: "Loading dashboard...",
    loadingMasterData: "Loading master data...",

    adminLoginHint: "Admin login: admin / admin",
    adminDashboard: "Admin Dashboard",
    openAdminDashboard: "Open Admin Dashboard",
    accessDenied: "Access denied",
    adminOnly: "Admin access only.",

    success: "Success",
    done: "Done",
    error: "Error",
    missingData: "Missing Data",
    loginFailed: "Login failed",
    signUpFailed: "Sign up failed",
    accountCreated: "Account created successfully.",
  },

  ar: {
    appName: "تطبيق قيم",
    appTagline: "نظام متابعة المبيعات الميدانية",

    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    signOut: "تسجيل الخروج",
    createAccount: "إنشاء حساب",
    welcomeBack: "سجّل الدخول للمتابعة",
    noAccount: "ليس لديك حساب؟",
    haveAccount: "لديك حساب بالفعل؟",
    fullName: "الاسم بالكامل",
    email: "البريد الإلكتروني",
    usernameOrEmail: "اسم المستخدم أو البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",

    overview: "نظرة عامة",
    submissions: "المدخلات",
    masterData: "البيانات الأساسية",
    salesForm: "فورم المبيعات",

    customerDetails: "بيانات العميل",
    customerName: "اسم العميل",
    invoiceNumber: "رقم الفاتورة",
    address: "العنوان",
    phone: "رقم الهاتف",
    salesData: "بيانات المبيعات",
    salesRep: "مندوب المبيعات",
    region: "المنطقة",
    district: "الحي / الإدارة",
    sector: "القطاع",
    territory: "النطاق",
    salesTeam: "فريق المبيعات",
    notes: "ملاحظات",

    gpsLocation: "موقع GPS",
    captureLocation: "تسجيل الموقع الحالي",
    latitude: "خط العرض",
    longitude: "خط الطول",
    notCaptured: "لم يتم التسجيل",

    submit: "إرسال",
    save: "حفظ",
    add: "إضافة",
    update: "تحديث",
    delete: "حذف",
    cancel: "إلغاء",
    edit: "تعديل",
    refresh: "تحديث",

    selectOption: "اختر من القائمة",
    searchPlaceholder: "بحث...",
    noResults: "لا توجد نتائج",

    loading: "جاري التحميل...",
    loadingDashboard: "جاري تحميل لوحة التحكم...",
    loadingMasterData: "جاري تحميل البيانات الأساسية...",

    adminLoginHint: "دخول الأدمن: admin / admin",
    adminDashboard: "لوحة تحكم الأدمن",
    openAdminDashboard: "فتح لوحة تحكم الأدمن",
    accessDenied: "غير مسموح",
    adminOnly: "هذه الصفحة للأدمن فقط.",

    success: "تم بنجاح",
    done: "تم",
    error: "خطأ",
    missingData: "بيانات ناقصة",
    loginFailed: "فشل تسجيل الدخول",
    signUpFailed: "فشل إنشاء الحساب",
    accountCreated: "تم إنشاء الحساب بنجاح.",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

type I18nContextType = {
  language: Language;
  isArabic: boolean;
  dir: "ltr" | "rtl";
  t: (key: TranslationKey) => string;
  setLanguage: (language: Language) => Promise<void>;
  toggleLanguage: () => Promise<void>;
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((savedLanguage) => {
      if (savedLanguage === "en" || savedLanguage === "ar") {
        setLanguageState(savedLanguage);
      }
    });
  }, []);

  async function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage);
    await AsyncStorage.setItem(STORAGE_KEY, nextLanguage);
  }

  async function toggleLanguage() {
    await setLanguage(language === "en" ? "ar" : "en");
  }

  const value = useMemo<I18nContextType>(() => {
    const isArabic = language === "ar";

    return {
      language,
      isArabic,
      dir: isArabic ? "rtl" : "ltr",
      t: (key: TranslationKey) => translations[language][key] ?? key,
      setLanguage,
      toggleLanguage,
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}