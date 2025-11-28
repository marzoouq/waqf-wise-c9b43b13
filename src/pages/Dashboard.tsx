import { useState, useEffect } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { MobileOptimizedLayout } from "@/components/layout/MobileOptimizedLayout";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { KPISkeleton } from "@/components/dashboard/KPISkeleton";
import { DashboardDialogs } from "@/components/dashboard/DashboardDialogs";

const Dashboard = () => {
  const navigate = useNavigate();
  const { isBeneficiary, isAccountant, isNazer, isAdmin, isCashier, isArchivist, isLoading: roleLoading } = useUserRole();
  
  const [isBeneficiaryDialogOpen, setIsBeneficiaryDialogOpen] = useState(false);
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isDistributionDialogOpen, setIsDistributionDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  // Role-based routing
  useEffect(() => {
    if (isBeneficiary) {
      navigate("/beneficiary-dashboard", { replace: true });
    } else if (isAccountant) {
      navigate("/accountant-dashboard", { replace: true });
    } else if (isNazer) {
      navigate("/nazer-dashboard", { replace: true });
    } else if (isAdmin) {
      navigate("/admin-dashboard", { replace: true });
    } else if (isCashier) {
      navigate("/cashier-dashboard", { replace: true });
    } else if (isArchivist) {
      navigate("/archivist-dashboard", { replace: true });
    }
  }, [isBeneficiary, isAccountant, isNazer, isAdmin, isCashier, isArchivist, navigate]);

  if (roleLoading) {
    return (
      <MobileOptimizedLayout>
        <KPISkeleton />
      </MobileOptimizedLayout>
    );
  }

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
