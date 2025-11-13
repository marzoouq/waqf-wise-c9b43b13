import { useState } from "react";
import { User, Bell, Shield, Database, Palette, Globe, Settings as SettingsIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileDialog } from "@/components/settings/ProfileDialog";
import { NotificationsSettingsDialog } from "@/components/settings/NotificationsSettingsDialog";
import { SecuritySettingsDialog } from "@/components/settings/SecuritySettingsDialog";
import { DatabaseSettingsDialog } from "@/components/settings/DatabaseSettingsDialog";
import { AppearanceSettingsDialog } from "@/components/settings/AppearanceSettingsDialog";
import { LanguageSettingsDialog } from "@/components/settings/LanguageSettingsDialog";
import { SystemSettingsDialog } from "@/components/settings/SystemSettingsDialog";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false);
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [databaseDialogOpen, setDatabaseDialogOpen] = useState(false);
  const [appearanceDialogOpen, setAppearanceDialogOpen] = useState(false);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [systemSettingsDialogOpen, setSystemSettingsDialogOpen] = useState(false);

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
      title: "الملف الشخصي",
      description: "إدارة معلومات الحساب والبيانات الشخصية",
      icon: User,
      color: "bg-primary/10 text-primary",
    },
    {
      id: 2,
      title: "الإشعارات",
      description: "تخصيص إعدادات التنبيهات والإشعارات",
      icon: Bell,
      color: "bg-success/10 text-success",
    },
    {
      id: 3,
      title: "الأمان والخصوصية",
      description: "إدارة كلمة المرور والمصادقة الثنائية",
      icon: Shield,
      color: "bg-warning/10 text-warning",
    },
    {
      id: 4,
      title: "قاعدة البيانات",
      description: "إعدادات النسخ الاحتياطي والاستعادة",
      icon: Database,
      color: "bg-accent/10 text-accent",
    },
    {
      id: 5,
      title: "المظهر",
      description: "تخصيص الألوان والثيم",
      icon: Palette,
      color: "bg-primary/10 text-primary",
    },
    {
      id: 6,
      title: "اللغة والمنطقة",
      description: "إعدادات اللغة والمنطقة الزمنية",
      icon: Globe,
      color: "bg-success/10 text-success",
    },
    {
      id: 7,
      title: "إعدادات النظام",
      description: "إدارة الإعدادات العامة والمتقدمة",
      icon: SettingsIcon,
      color: "bg-indigo-500/10 text-indigo-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gradient-primary">
            الإعدادات
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            إدارة إعدادات النظام والتفضيلات الشخصية
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {settingsSections.map((section) => {
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
        </div>

        {/* System Info */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">معلومات النظام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">الإصدار</p>
                <p className="font-medium">v1.0.0</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">آخر تحديث</p>
                <p className="font-medium">2024-08-15</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">المنطقة الزمنية</p>
                <p className="font-medium">توقيت الرياض (UTC+3)</p>
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
      </div>
    </div>
  );
};

export default Settings;
