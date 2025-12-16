import { useState } from "react";
import { User, Bell, Shield, Palette, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { ProfileDialog } from "@/components/settings/ProfileDialog";
import { NotificationsSettingsDialog } from "@/components/settings/NotificationsSettingsDialog";
import { SecuritySettingsDialog } from "@/components/settings/SecuritySettingsDialog";
import { AppearanceSettingsDialog } from "@/components/settings/AppearanceSettingsDialog";
import { PushNotificationsSettings } from "@/components/settings/PushNotificationsSettings";
import { LeakedPasswordCheck } from "@/components/settings/LeakedPasswordCheck";
import { BiometricSettings } from "@/components/settings/BiometricSettings";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/ui/use-toast";
import { MobileOptimizedLayout, MobileOptimizedHeader, MobileOptimizedGrid } from "@/components/layout/MobileOptimizedLayout";

const BeneficiarySettings = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false);
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [appearanceDialogOpen, setAppearanceDialogOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      });
    }
  };

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
      case "المظهر":
        setAppearanceDialogOpen(true);
        break;
      case "تسجيل الخروج":
        handleLogout();
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
      color: "bg-success/10 text-success",
    },
    {
      id: 2,
      title: "الإشعارات",
      description: "تخصيص إعدادات التنبيهات والإشعارات",
      icon: Bell,
      color: "bg-warning/10 text-warning-foreground",
    },
    {
      id: 3,
      title: "الأمان والخصوصية",
      description: "إدارة كلمة المرور والمصادقة الثنائية",
      icon: Shield,
      color: "bg-destructive/10 text-destructive",
    },
    {
      id: 4,
      title: "المظهر",
      description: "تخصيص الألوان والثيم",
      icon: Palette,
      color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    },
  ];

  return (
    <PageErrorBoundary pageName="الإعدادات">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="الإعدادات"
          description="إدارة إعدادات حسابك والتفضيلات الشخصية"
          icon={<User className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        />

        {/* Settings Grid */}
        <MobileOptimizedGrid cols={2}>
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
        </MobileOptimizedGrid>

        {/* Logout Button */}
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              <LogOut className="ms-2 h-5 w-5" />
              تسجيل الخروج
            </Button>
          </CardContent>
        </Card>

        {/* Security Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BiometricSettings />
          <PushNotificationsSettings />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeakedPasswordCheck />
        </div>

        {/* Dialogs */}
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
        <AppearanceSettingsDialog
          open={appearanceDialogOpen}
          onOpenChange={setAppearanceDialogOpen}
        />
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default BeneficiarySettings;
