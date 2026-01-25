/**
 * MoreMenuTab Component
 * قائمة خيارات "المزيد" للمستفيد
 * @version 1.1.0
 * - إضافة تأكيد قبل تسجيل الخروج
 * - تحسين معالجة الأخطاء
 */

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

import { 
  FileText, Building2, FolderOpen, Scale, 
  CreditCard, Settings, LogOut, ChevronLeft,
  HelpCircle
} from "lucide-react";
import { useVisibilitySettings } from "@/hooks/governance/useVisibilitySettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MenuItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  tab?: string;
  href?: string;
  action?: () => void;
  settingKey?: string;
  variant?: "default" | "danger";
}

export function MoreMenuTab() {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { settings } = useVisibilitySettings();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      toast.success("تم تسجيل الخروج بنجاح");
      navigate("/auth");
    } catch (error: unknown) {
      console.error('Logout error:', error);
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const menuItems: MenuItem[] = [
    { 
      id: "reports", 
      label: "التقارير والإفصاحات", 
      description: "عرض التقارير المالية والإفصاحات السنوية",
      icon: FileText, 
      tab: "reports-detail",
      settingKey: "show_financial_reports"
    },
    { 
      id: "properties", 
      label: "العقارات", 
      description: "عرض عقارات الوقف والوحدات",
      icon: Building2, 
      tab: "properties",
      settingKey: "show_properties"
    },
    { 
      id: "documents", 
      label: "المستندات", 
      description: "عرض وتحميل المستندات الخاصة بك",
      icon: FolderOpen, 
      tab: "documents",
      settingKey: "show_documents"
    },
    { 
      id: "governance", 
      label: "الحوكمة", 
      description: "القرارات والسياسات والميزانيات",
      icon: Scale, 
      tab: "governance",
      settingKey: "show_governance"
    },
    { 
      id: "loans", 
      label: "القروض", 
      description: "عرض القروض وحالة السداد",
      icon: CreditCard, 
      tab: "loans",
      settingKey: "show_own_loans"
    },
    { 
      id: "support", 
      label: "الدعم والمساعدة", 
      description: "تواصل مع فريق الدعم",
      icon: HelpCircle, 
      href: "/beneficiary-support"
    },
    { 
      id: "settings", 
      label: "الإعدادات", 
      description: "إعدادات الحساب والإشعارات",
      icon: Settings, 
      href: "/beneficiary-settings"
    },
    { 
      id: "logout", 
      label: "تسجيل الخروج", 
      icon: LogOut, 
      action: () => setShowLogoutConfirm(true),
      variant: "danger"
    },
  ];

  const handleItemClick = async (item: MenuItem) => {
    try {
      if (item.action) {
        await item.action();
      } else if (item.href) {
        navigate(item.href);
      } else if (item.tab) {
        setSearchParams({ tab: item.tab });
      }
    } catch (error: unknown) {
      console.error('Navigation error:', error);
      toast.error('حدث خطأ أثناء التنقل');
    }
  };

  const visibleItems = menuItems.filter(item => {
    if (!item.settingKey) return true;
    return settings?.[item.settingKey as keyof typeof settings];
  });

  return (
    <>
      <div className="space-y-3 pb-20">
        <h2 className="text-lg font-semibold text-foreground mb-4">المزيد من الخيارات</h2>
        
        {visibleItems.map((item) => (
          <Card 
            key={item.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              item.variant === "danger" 
                ? "hover:bg-destructive/10 hover:border-destructive/50" 
                : "hover:bg-accent/50"
            }`}
            onClick={() => handleItemClick(item)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  item.variant === "danger" 
                    ? "bg-destructive/10" 
                    : "bg-primary/10"
                }`}>
                  <item.icon className={`h-5 w-5 ${
                    item.variant === "danger" 
                      ? "text-destructive" 
                      : "text-primary"
                  }`} />
                </div>
                <div className="flex flex-col">
                  <span className={`font-medium ${
                    item.variant === "danger" ? "text-destructive" : ""
                  }`}>
                    {item.label}
                  </span>
                  {item.description && (
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </div>
              </div>
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* تأكيد تسجيل الخروج */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد تسجيل الخروج</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel disabled={isLoggingOut}>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoggingOut ? "جاري الخروج..." : "تسجيل الخروج"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
