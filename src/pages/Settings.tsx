import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Bell, Shield, Database, Palette, Globe, Settings as SettingsIcon, Building2, Calendar, Eye, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { ProfileDialog } from "@/components/settings/ProfileDialog";
import { NotificationsSettingsDialog } from "@/components/settings/NotificationsSettingsDialog";
import { SecuritySettingsDialog } from "@/components/settings/SecuritySettingsDialog";
import { DatabaseSettingsDialog } from "@/components/settings/DatabaseSettingsDialog";
import { AppearanceSettingsDialog } from "@/components/settings/AppearanceSettingsDialog";
import { LanguageSettingsDialog } from "@/components/settings/LanguageSettingsDialog";
import { SystemSettingsDialog } from "@/components/settings/SystemSettingsDialog";
import { PaymentSettingsDialog } from "@/components/settings/PaymentSettingsDialog";
import OrganizationSettingsDialog from "@/components/settings/OrganizationSettingsDialog";
import { PushNotificationsSettings } from "@/components/settings/PushNotificationsSettings";
import { LeakedPasswordCheck } from "@/components/settings/LeakedPasswordCheck";
import { LanguageSelector } from "@/components/settings/LanguageSelector";
import { RolesSettingsDialog } from "@/components/settings/RolesSettingsDialog";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { MobileOptimizedLayout, MobileOptimizedHeader, MobileOptimizedGrid } from "@/components/layout/MobileOptimizedLayout";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isNazer, isAdmin } = useUserRole();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false);
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [databaseDialogOpen, setDatabaseDialogOpen] = useState(false);
  const [appearanceDialogOpen, setAppearanceDialogOpen] = useState(false);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [systemSettingsDialogOpen, setSystemSettingsDialogOpen] = useState(false);
  const [organizationDialogOpen, setOrganizationDialogOpen] = useState(false);
  const [paymentSettingsDialogOpen, setPaymentSettingsDialogOpen] = useState(false);
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);

  const handleSectionClick = (sectionTitle: string) => {
    switch (sectionTitle) {
      case "الملف الشخصي":
        setProfileDialogOpen(true);
        break;
      case "الإشعارات":
        setNotificationsDialogOpen(true);
        break;
      case "الأمان والخصوصية":
        setSecurityDialogOpen(true);
        break;
      case "قاعدة البيانات":
        setDatabaseDialogOpen(true);
        break;
      case "المظهر":
        setAppearanceDialogOpen(true);
        break;
      case "اللغة والمنطقة":
        setLanguageDialogOpen(true);
        break;
      case "إعدادات النظام":
        setSystemSettingsDialogOpen(true);
        break;
      case "إعدادات المنشأة":
        setOrganizationDialogOpen(true);
        break;
      case "إعدادات الدفعات":
        setPaymentSettingsDialogOpen(true);
        break;
      case "الأدوار والصلاحيات":
        setRolesDialogOpen(true);
        break;
      case "إعدادات الشفافية":
        navigate("/transparency-settings");
        break;
      case "دليل المطور":
        navigate("/developer-guide");
        break;
      default:
        toast({
          title: `إعدادات ${sectionTitle}`,
          description: "هذه الميزة قيد التطوير",
        });
    }
  };

  const settingsSections = [
    {
      id: 1,
      title: "إعدادات المنشأة",
      description: "معلومات المنشأة للفواتير الضريبية",
      icon: Building2,
      color: "bg-primary/10 text-primary",
    },
    {
      id: 2,
      title: "الملف الشخصي",
      description: "إدارة معلومات الحساب والبيانات الشخصية",
      icon: User,
      color: "bg-success/10 text-success",
    },
    {
      id: 3,
      title: "الإشعارات",
      description: "تخصيص إعدادات التنبيهات والإشعارات",
      icon: Bell,
      color: "bg-warning/10 text-warning",
    },
    {
      id: 4,
      title: "الأمان والخصوصية",
      description: "إدارة كلمة المرور والمصادقة الثنائية",
      icon: Shield,
      color: "bg-destructive/10 text-destructive",
    },
    {
      id: 5,
      title: "قاعدة البيانات",
      description: "إعدادات النسخ الاحتياطي والاستعادة",
      icon: Database,
      color: "bg-accent/10 text-accent",
    },
    {
      id: 6,
      title: "المظهر",
      description: "تخصيص الألوان والثيم",
      icon: Palette,
      color: "bg-primary/10 text-primary",
    },
    {
      id: 7,
      title: "اللغة والمنطقة",
      description: "إعدادات اللغة والمنطقة الزمنية",
      icon: Globe,
      color: "bg-success/10 text-success",
    },
    {
      id: 8,
      title: "إعدادات النظام",
      description: "إدارة الإعدادات العامة والمتقدمة",
      icon: SettingsIcon,
      color: "bg-primary/10 text-primary",
    },
    {
      id: 9,
      title: "إعدادات الدفعات",
      description: "تخصيص عرض الدفعات والإيجارات",
      icon: Calendar,
      color: "bg-info-light text-info",
    },
    {
      id: 10,
      title: "الأدوار والصلاحيات",
      description: "عرض وإدارة أدوار المستخدمين",
      icon: Shield,
      color: "bg-primary/10 text-primary",
    },
    {
      id: 11,
      title: "إعدادات الشفافية",
      description: "التحكم في ما يراه المستفيدون من الدرجة الأولى",
      icon: Eye,
      color: "bg-info/10 text-info",
      requiredRole: "nazer",
    },
    {
      id: 12,
      title: "دليل المطور",
      description: "دليل شامل للبنية المعمارية والميزات والتوثيق",
      icon: BookOpen,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      requiredRole: "admin",
    },
  ];

  return (
    <PageErrorBoundary pageName="الإعدادات">
      <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="الإعدادات"
        description="إدارة إعدادات النظام والتفضيلات الشخصية"
        icon={<SettingsIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        actions={<LanguageSelector />}
      />

      {/* Settings Grid */}
      <MobileOptimizedGrid cols={3}>
        {settingsSections
          .filter((section) => {
            // إخفاء قسم الشفافية إذا لم يكن الناظر أو المشرف
            if (section.requiredRole === "nazer" && !isNazer && !isAdmin) {
              return false;
            }
            // إخفاء دليل المطور إذا لم يكن مشرف
            if (section.requiredRole === "admin" && !isAdmin) {
              return false;
            }
            return true;
          })
          .map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.id}
              onClick={() => handleSectionClick(section.title)}
              className="shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer group"
            >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${section.color} flex-shrink-0`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {section.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-2">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
      </MobileOptimizedGrid>

      {/* System Info */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">معلومات النظام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">الإصدار</p>
                <p className="font-medium text-primary">v{import.meta.env.VITE_APP_VERSION || '2.1.0'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">آخر تحديث</p>
                <p className="font-medium">{new Date().toLocaleDateString('ar-SA')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">المنطقة الزمنية</p>
                <p className="font-medium">توقيت الرياض (UTC+3)</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">البيئة</p>
                <p className="font-medium">{import.meta.env.MODE === 'production' ? 'إنتاج' : 'تطوير'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">React Query</p>
                <p className="font-medium">v5.83.0+</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">قاعدة البيانات</p>
                <p className="font-medium text-success">متصلة ✓</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ProfileDialog
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
        />
        <NotificationsSettingsDialog
          open={notificationsDialogOpen}
          onOpenChange={setNotificationsDialogOpen}
        />
        <SecuritySettingsDialog
          open={securityDialogOpen}
          onOpenChange={setSecurityDialogOpen}
        />
        <DatabaseSettingsDialog
          open={databaseDialogOpen}
          onOpenChange={setDatabaseDialogOpen}
        />
        <AppearanceSettingsDialog
          open={appearanceDialogOpen}
          onOpenChange={setAppearanceDialogOpen}
        />
        <LanguageSettingsDialog
          open={languageDialogOpen}
          onOpenChange={setLanguageDialogOpen}
        />
        <SystemSettingsDialog
          open={systemSettingsDialogOpen}
          onOpenChange={setSystemSettingsDialogOpen}
        />
        <OrganizationSettingsDialog
          open={organizationDialogOpen}
          onOpenChange={setOrganizationDialogOpen}
        />
        <PaymentSettingsDialog
          open={paymentSettingsDialogOpen}
          onOpenChange={setPaymentSettingsDialogOpen}
        />
        <RolesSettingsDialog
          open={rolesDialogOpen}
          onOpenChange={setRolesDialogOpen}
        />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PushNotificationsSettings />
        <LeakedPasswordCheck />
      </div>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default Settings;
