import { useState, useMemo, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DistributionDialog } from "@/components/funds/DistributionDialog";
import { SimulationDialog } from "@/components/funds/SimulationDialog";
import { DistributionSettingsDialog } from "@/components/distributions/DistributionSettingsDialog";
import { useDistributions } from "@/hooks/useDistributions";
import { useFunds } from "@/hooks/useFunds";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { logger } from "@/lib/logger";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { AnnualDisclosureTab } from "@/components/funds/tabs/AnnualDisclosureTab";
import { OverviewTab } from "@/components/funds/tabs/OverviewTab";
import { FundsTab } from "@/components/funds/tabs/FundsTab";
import { DistributionsTab } from "@/components/funds/tabs/DistributionsTab";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";

const Funds = () => {
  const [distributionDialogOpen, setDistributionDialogOpen] = useState(false);
  const [simulationDialogOpen, setSimulationDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { distributions, isLoading: distributionsLoading, addDistributionAsync } = useDistributions();
  const { funds, isLoading: fundsLoading } = useFunds();
  const { createAutoEntry } = useJournalEntries();

  const handleDistribute = async (data: Record<string, unknown>) => {
    try {
      const dbData = {
        month: `${data.month} 1446`,
        total_amount: data.totalAmount as number,
        waqf_unit_id: data.waqfUnit as string,
        beneficiaries_count: (data.beneficiaryIds as string[])?.length || 0,
        status: "معلق",
        distribution_date: new Date().toISOString().split('T')[0],
        notes: (data.notes as string) || null,
      };
      
      const result = await addDistributionAsync(dbData);

      await createAutoEntry(
        'distribution_created',
        result.id,
        Number(data.totalAmount),
        `توزيع ${data.month} - ${(data.beneficiaryIds as string[])?.length || 0} مستفيد`,
        dbData.distribution_date
      );

      setDistributionDialogOpen(false);
    } catch (error) {
      logger.error(error, { context: 'create_distribution', severity: 'medium' });
    }
  };

  const summaryStats = useMemo(() => {
    const totalAllocated = funds.reduce((sum, f) => sum + Number(f.allocated_amount), 0);
    const totalSpent = funds.reduce((sum, f) => sum + Number(f.spent_amount), 0);
    const totalAvailable = totalAllocated - totalSpent;
    const activeBeneficiaries = funds.reduce((sum, f) => sum + f.beneficiaries_count, 0);

    return {
      totalAllocated,
      totalSpent,
      totalAvailable,
      activeBeneficiaries,
    };
  }, [funds]);

  return (
    <PageErrorBoundary pageName="صفحة الأموال والتوزيعات">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="الأموال والتوزيعات"
          description="إدارة أقلام الوقف وتوزيع الغلة"
          actions={
            <div className="flex flex-col md:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSimulationDialogOpen(true)}
                className="gap-2"
              >
                <PieChart className="h-4 w-4" />
                <span className="hidden sm:inline">محاكاة</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setDistributionDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">توزيع جديد</span>
              </Button>
              <DistributionSettingsDialog />
            </div>
          }
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">نظرة عامة</TabsTrigger>
            <TabsTrigger value="funds" className="text-xs sm:text-sm">أقلام الوقف</TabsTrigger>
            <TabsTrigger value="distributions" className="text-xs sm:text-sm">التوزيعات</TabsTrigger>
            <TabsTrigger value="disclosure" className="text-xs sm:text-sm">الإفصاح السنوي</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab summaryStats={summaryStats} distributions={distributions} />
          </TabsContent>

          <TabsContent value="funds" className="space-y-6">
            <FundsTab funds={funds} isLoading={fundsLoading} />
          </TabsContent>

          <TabsContent value="distributions" className="space-y-6">
            <DistributionsTab />
          </TabsContent>

          <TabsContent value="disclosure" className="space-y-6">
            <Suspense fallback={
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            }>
              <AnnualDisclosureTab />
            </Suspense>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <DistributionDialog
          open={distributionDialogOpen}
          onOpenChange={setDistributionDialogOpen}
          onDistribute={handleDistribute}
        />

        <SimulationDialog
          open={simulationDialogOpen}
          onOpenChange={setSimulationDialogOpen}
        />
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default Funds;
