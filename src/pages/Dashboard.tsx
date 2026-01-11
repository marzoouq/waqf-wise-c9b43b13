import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UnifiedDashboardLayout } from "@/components/dashboard/UnifiedDashboardLayout";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { DashboardDialogs } from "@/components/dashboard/DashboardDialogs";
import { SEOHead } from "@/components/shared/SEOHead";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardForRoles, type AppRole } from "@/types/roles";

/**
 * لوحة التحكم العامة - للمستخدمين بدون دور محدد
 * ✅ تتحقق من الأدوار وتعيد التوجيه للوحة المناسبة
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { roles, rolesLoading, user } = useAuth();
  const [isBeneficiaryDialogOpen, setIsBeneficiaryDialogOpen] = useState(false);
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isDistributionDialogOpen, setIsDistributionDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [hasCheckedRoles, setHasCheckedRoles] = useState(false);

  // ✅ إعادة التوجيه إذا كان للمستخدم دور محدد
  useEffect(() => {
    if (rolesLoading || hasCheckedRoles) return;
    
    if (user && roles && roles.length > 0) {
      const targetDashboard = getDashboardForRoles(roles as AppRole[]);
      
      // ✅ إذا لم يكن الدور "user" فقط، أعد التوجيه
      if (targetDashboard !== '/dashboard') {
        navigate(targetDashboard, { replace: true });
        return;
      }
    }
    
    setHasCheckedRoles(true);
  }, [roles, rolesLoading, user, navigate, hasCheckedRoles]);

  // ✅ عرض التحميل أثناء انتظار الأدوار
  if (rolesLoading || (!hasCheckedRoles && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="لوحة التحكم" 
        description="لوحة التحكم الرئيسية - إدارة الوقف والمستفيدين والعقارات"
      />
      <UnifiedDashboardLayout
      role="user"
      actions={
        <Button onClick={() => setMessageDialogOpen(true)} className="gap-2">
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">إرسال رسالة</span>
        </Button>
      }
    >
      <DashboardTabs
        onOpenBeneficiaryDialog={() => setIsBeneficiaryDialogOpen(true)}
        onOpenPropertyDialog={() => setIsPropertyDialogOpen(true)}
        onOpenDistributionDialog={() => setIsDistributionDialogOpen(true)}
      />

      <DashboardDialogs
        beneficiaryDialogOpen={isBeneficiaryDialogOpen}
        setBeneficiaryDialogOpen={setIsBeneficiaryDialogOpen}
        propertyDialogOpen={isPropertyDialogOpen}
        setPropertyDialogOpen={setIsPropertyDialogOpen}
        distributionDialogOpen={isDistributionDialogOpen}
        setDistributionDialogOpen={setIsDistributionDialogOpen}
        messageDialogOpen={messageDialogOpen}
        setMessageDialogOpen={setMessageDialogOpen}
      />
    </UnifiedDashboardLayout>
    </>
  );
};

export default Dashboard;
