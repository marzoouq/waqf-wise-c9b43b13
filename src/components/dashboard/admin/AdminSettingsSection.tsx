import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { LoadingState } from "@/components/shared/LoadingState";
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
  ArrowLeft
} from "lucide-react";

export function AdminSettingsSection() {
  const navigate = useNavigate();
  const { settings, isLoading, getSetting } = useSystemSettings();

  if (isLoading) {
    return <LoadingState message="جاري تحميل الإعدادات..." />;
  }

  const settingsCategories = [
    {
      title: "إعدادات النظام العامة",
      icon: Settings,
      description: "إدارة الإعدادات الأساسية للنظام",
      color: "bg-primary/10 text-primary",
      action: () => navigate("/settings"),
      settings: [
        { label: "مهلة الجلسة", value: `${getSetting('session_timeout_minutes') || '30'} دقيقة` },
        { label: "حد الموافقة", value: `${Number(getSetting('payment_approval_threshold') || '50000').toLocaleString()} ريال` },
      ]
    },
    {
      title: "الأمان والخصوصية",
      icon: Shield,
      description: "إدارة إعدادات الأمان والمصادقة",
      color: "bg-destructive/10 text-destructive",
      action: () => navigate("/settings"),
      settings: [
        { label: "المصادقة الثنائية", value: getSetting('require_2fa') === 'true' ? "مفعّلة" : "معطّلة" },
        { label: "الحد الأدنى لكلمة المرور", value: `${getSetting('password_min_length') || '8'} أحرف` },
      ]
    },
    {
      title: "قاعدة البيانات",
      icon: Database,
      description: "النسخ الاحتياطي والاستعادة",
      color: "bg-accent/10 text-accent",
      action: () => navigate("/settings"),
      settings: [
        { label: "النسخ الاحتياطي التلقائي", value: getSetting('auto_backup_enabled') === 'true' ? "مفعّل" : "معطّل" },
        { label: "تكرار النسخ الاحتياطي", value: getSetting('backup_frequency') || "يومي" },
      ]
    },
    {
      title: "الإشعارات",
      icon: Bell,
      description: "إدارة إشعارات النظام",
      color: "bg-warning/10 text-warning",
      action: () => navigate("/settings"),
      settings: [
        { label: "إشعارات البريد", value: getSetting('email_notifications_enabled') === 'true' ? "مفعّلة" : "معطّلة" },
        { label: "إشعارات SMS", value: getSetting('sms_notifications_enabled') === 'true' ? "مفعّلة" : "معطّلة" },
      ]
    },
    {
      title: "الإعدادات المالية",
      icon: DollarSign,
      description: "إعدادات المدفوعات والدفعات",
      color: "bg-success/10 text-success",
      action: () => navigate("/settings"),
      settings: [
        { label: "العملة الافتراضية", value: getSetting('default_currency') || "SAR" },
        { label: "الفترة المالية", value: getSetting('fiscal_year_start') || "01/01" },
      ]
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
      ]
    },
    {
      title: "إعدادات المنشأة",
      icon: Building2,
      description: "بيانات المنشأة للفواتير",
      color: "bg-primary/10 text-primary",
      action: () => navigate("/settings"),
      settings: [
        { label: "اسم المنشأة", value: getSetting('organization_name') || "غير محدد" },
        { label: "الرقم الضريبي", value: getSetting('tax_number') || "غير محدد" },
      ]
    },
    {
      title: "المظهر",
      icon: Palette,
      description: "تخصيص الألوان والثيم",
      color: "bg-purple-500/10 text-purple-600",
      action: () => navigate("/settings"),
      settings: [
        { label: "الثيم", value: "حسب النظام" },
        { label: "اللغة", value: "العربية" },
      ]
    },
    {
      title: "اللغة والمنطقة",
      icon: Globe,
      description: "إعدادات اللغة والمنطقة الزمنية",
      color: "bg-success/10 text-success",
      action: () => navigate("/settings"),
      settings: [
        { label: "اللغة الافتراضية", value: getSetting('default_language') || "العربية" },
        { label: "المنطقة الزمنية", value: getSetting('timezone') || "Asia/Riyadh" },
      ]
    },
    {
      title: "الشفافية",
      icon: Eye,
      description: "التحكم في البيانات المرئية للمستفيدين",
      color: "bg-info-light/10 text-info",
      action: () => navigate("/transparency-settings"),
      settings: [
        { label: "إخفاء المبالغ", value: getSetting('hide_amounts_from_beneficiaries') === 'true' ? "مفعّل" : "معطّل" },
        { label: "إخفاء التواريخ", value: getSetting('hide_dates_from_beneficiaries') === 'true' ? "مفعّل" : "معطّل" },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">إعدادات النظام المتقدمة</CardTitle>
              <CardDescription className="mt-2">
                إدارة شاملة لجميع إعدادات النظام والتفضيلات
              </CardDescription>
            </div>
            <Button 
              onClick={() => navigate("/settings")} 
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              فتح جميع الإعدادات
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card 
              key={category.title}
              className="cursor-pointer hover:shadow-md transition-all duration-200 group"
              onClick={category.action}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${category.color} flex-shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {category.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.settings.map((setting, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{setting.label}</span>
                      <span className="font-medium">{setting.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="justify-start gap-2"
              onClick={() => navigate("/users")}
            >
              <Users className="h-4 w-4" />
              إدارة المستخدمين
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2"
              onClick={() => navigate("/security")}
            >
              <Shield className="h-4 w-4" />
              لوحة الأمان
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2"
              onClick={() => navigate("/performance")}
            >
              <Database className="h-4 w-4" />
              مراقبة الأداء
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2"
              onClick={() => navigate("/audit-logs")}
            >
              <Settings className="h-4 w-4" />
              سجلات النظام
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
