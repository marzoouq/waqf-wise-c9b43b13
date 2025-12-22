import { useState } from "react";
import { UnifiedDashboardLayout } from "@/components/dashboard/UnifiedDashboardLayout";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { DashboardDialogs } from "@/components/dashboard/DashboardDialogs";
import { SEOHead } from "@/components/shared/SEOHead";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

/**
 * لوحة التحكم العامة - للمستخدمين بدون دور محدد
 * التوجيه حسب الدور يتم الآن عبر RoleBasedRedirect في App.tsx
 */
const Dashboard = () => {
  const [isBeneficiaryDialogOpen, setIsBeneficiaryDialogOpen] = useState(false);
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isDistributionDialogOpen, setIsDistributionDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

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
