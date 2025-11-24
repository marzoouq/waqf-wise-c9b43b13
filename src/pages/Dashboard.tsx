import { useState, useEffect } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MobileOptimizedLayout } from "@/components/layout/MobileOptimizedLayout";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { DashboardDialogs } from "@/components/dashboard/DashboardDialogs";

const KPISkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
    {[...Array(8)].map((_, i) => (
      <Card key={i} className="shadow-soft">
        <CardHeader className="pb-2 sm:pb-3">
          <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 mb-1 sm:mb-2" />
          <Skeleton className="h-2 sm:h-3 w-16 sm:w-20" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { isBeneficiary, isAccountant, isNazer, isCashier, isArchivist, isLoading: roleLoading } = useUserRole();
  
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
    } else if (isCashier) {
      navigate("/cashier-dashboard", { replace: true });
    } else if (isArchivist) {
      navigate("/archivist-dashboard", { replace: true });
    }
  }, [isBeneficiary, isAccountant, isNazer, isCashier, isArchivist, navigate]);

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
