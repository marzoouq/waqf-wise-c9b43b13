import { useState } from "react";
import { MobileOptimizedLayout } from "@/components/layout/MobileOptimizedLayout";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { DashboardDialogs } from "@/components/dashboard/DashboardDialogs";

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
    <DashboardLayout onMessageClick={() => setMessageDialogOpen(true)}>
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
    </DashboardLayout>
  );
};

export default Dashboard;
