import { useNavigate } from "react-router-dom";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import {
  Settings,
  Database,
  Shield,
  Bell,
  DollarSign,
  Users,
  Building2,
  Palette,
  Globe,
  Eye,
} from "lucide-react";

export function useSettingsCategories() {
  const navigate = useNavigate();
  const { isLoading, getSetting, error, refetch } = useSystemSettings();

  const categories = [
    {
      title: "إعدادات النظام العامة",
      icon: Settings,
      description: "إدارة الإعدادات الأساسية للنظام",
      color: "bg-primary/10 text-primary",
      action: () => navigate("/settings?section=general"),
      settings: [
        { label: "مهلة الجلسة", value: `${getSetting("session_timeout_minutes") || "30"} دقيقة` },
        { label: "حد الموافقة", value: `${Number(getSetting("payment_approval_threshold") || "50000").toLocaleString()} ريال` },
      ],
    },
    {
      title: "الأمان والخصوصية",
      icon: Shield,
      description: "إدارة إعدادات الأمان والمصادقة",
      color: "bg-destructive/10 text-destructive",
      action: () => navigate("/settings?section=security"),
      settings: [
        { label: "المصادقة الثنائية", value: getSetting("require_2fa") === "true" ? "مفعّلة" : "معطّلة" },
        { label: "الحد الأدنى لكلمة المرور", value: `${getSetting("password_min_length") || "8"} أحرف` },
      ],
    },
    {
      title: "قاعدة البيانات",
      icon: Database,
      description: "النسخ الاحتياطي والاستعادة",
      color: "bg-accent/10 text-accent",
      action: () => navigate("/settings?section=database"),
      settings: [
        { label: "النسخ الاحتياطي التلقائي", value: getSetting("auto_backup_enabled") === "true" ? "مفعّل" : "معطّل" },
        { label: "تكرار النسخ الاحتياطي", value: getSetting("backup_frequency") || "يومي" },
      ],
    },
    {
      title: "الإشعارات",
      icon: Bell,
      description: "إدارة إشعارات النظام",
      color: "bg-warning/10 text-warning",
      action: () => navigate("/settings?section=notifications"),
      settings: [
        { label: "إشعارات البريد", value: getSetting("email_notifications_enabled") === "true" ? "مفعّلة" : "معطّلة" },
        { label: "إشعارات SMS", value: getSetting("sms_notifications_enabled") === "true" ? "مفعّلة" : "معطّلة" },
      ],
    },
    {
      title: "الإعدادات المالية",
      icon: DollarSign,
      description: "إعدادات المدفوعات والدفعات",
      color: "bg-success/10 text-success",
      action: () => navigate("/settings?section=financial"),
      settings: [
        { label: "العملة الافتراضية", value: getSetting("default_currency") || "SAR" },
        { label: "الفترة المالية", value: getSetting("fiscal_year_start") || "01/01" },
      ],
    },
    {
      title: "إدارة المستخدمين",
      icon: Users,
      description: "إعدادات الأدوار والصلاحيات",
      color: "bg-info/10 text-info",
      action: () => navigate("/users"),
      settings: [
        { label: "عدد المستخدمين", value: "حسب البيانات" },
        { label: "الأدوار النشطة", value: "7 أدوار" },
      ],
    },
    {
      title: "إعدادات المنشأة",
      icon: Building2,
      description: "بيانات المنشأة للفواتير",
      color: "bg-primary/10 text-primary",
      action: () => navigate("/settings?section=organization"),
      settings: [
        { label: "اسم المنشأة", value: getSetting("organization_name") || "غير محدد" },
        { label: "الرقم الضريبي", value: getSetting("tax_number") || "غير محدد" },
      ],
    },
    {
      title: "المظهر",
      icon: Palette,
      description: "تخصيص الألوان والثيم",
      color: "bg-accent/10 text-accent",
      action: () => navigate("/settings?section=appearance"),
      settings: [
        { label: "الثيم", value: "حسب النظام" },
        { label: "اللغة", value: "العربية" },
      ],
    },
    {
      title: "اللغة والمنطقة",
      icon: Globe,
      description: "إعدادات اللغة والمنطقة الزمنية",
      color: "bg-success/10 text-success",
      action: () => navigate("/settings?section=locale"),
      settings: [
        { label: "اللغة الافتراضية", value: getSetting("default_language") || "العربية" },
        { label: "المنطقة الزمنية", value: getSetting("timezone") || "Asia/Riyadh" },
      ],
    },
    {
      title: "الشفافية",
      icon: Eye,
      description: "التحكم في البيانات المرئية للمستفيدين",
      color: "bg-info/10 text-info",
      action: () => navigate("/transparency-settings"),
      settings: [
        { label: "إخفاء المبالغ", value: getSetting("hide_amounts_from_beneficiaries") === "true" ? "مفعّل" : "معطّل" },
        { label: "إخفاء التواريخ", value: getSetting("hide_dates_from_beneficiaries") === "true" ? "مفعّل" : "معطّل" },
      ],
    },
  ];

  return { categories, isLoading, error, refetch };
}
