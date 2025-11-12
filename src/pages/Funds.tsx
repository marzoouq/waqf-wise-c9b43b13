import { useState, useMemo } from "react";
import { Plus, TrendingUp, PieChart, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DistributionDialog } from "@/components/funds/DistributionDialog";
import { SimulationDialog } from "@/components/funds/SimulationDialog";
import { useDistributions } from "@/hooks/useDistributions";
import { useFunds } from "@/hooks/useFunds";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LoadingState, CardLoadingSkeleton } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";

const Funds = () => {
  const [distributionDialogOpen, setDistributionDialogOpen] = useState(false);
  const [simulationDialogOpen, setSimulationDialogOpen] = useState(false);

  const { distributions, isLoading: distributionsLoading, addDistribution } = useDistributions();
  const { funds, isLoading: fundsLoading } = useFunds();
  const { createAutoEntry } = useJournalEntries();

  const handleDistribute = async (data: any) => {
    try {
      const dbData = {
        month: `${data.month} 1446`,
        total_amount: data.totalAmount,
        beneficiaries_count: data.beneficiaries,
        status: "معلق",
        distribution_date: new Date().toISOString().split('T')[0],
        notes: data.notes || null,
      };
      
      const result = await addDistribution(dbData);

      // Create automatic journal entry for distribution
      await createAutoEntry(
        'distribution_created',
        result.id,
        Number(data.totalAmount),
        `توزيع ${data.month} - ${data.beneficiaries} مستفيد`,
        dbData.distribution_date
      );

      setDistributionDialogOpen(false);
    } catch (error) {
      console.error("Error creating distribution:", error);
    }
  };

  // Calculate summary stats from funds
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gradient-primary">
              الأموال والمصارف
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              إدارة أقلام الوقف وتوزيع الغلة
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              className="shadow-soft w-full md:w-auto"
              onClick={() => setSimulationDialogOpen(true)}
            >
              <PieChart className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">محاكاة التوزيع</span>
            </Button>
            <Button 
              className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-soft w-full md:w-auto"
              onClick={() => setDistributionDialogOpen(true)}
            >
              <Plus className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">توزيع جديد</span>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي الأموال
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fundsLoading ? (
                <LoadingState size="sm" message="" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-primary">
                    {summaryStats.totalAllocated.toLocaleString()} ر.س
                  </div>
                  <div className="flex items-center gap-1 text-sm text-success mt-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>+8.3%</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المصروفات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fundsLoading ? (
                <LoadingState size="sm" message="" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-warning">
                    {summaryStats.totalSpent.toLocaleString()} ر.س
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    من إجمالي {summaryStats.totalAllocated.toLocaleString()} ر.س
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                الرصيد المتاح
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fundsLoading ? (
                <LoadingState size="sm" message="" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-success">
                    {summaryStats.totalAvailable.toLocaleString()} ر.س
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    متاح للتوزيع
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المستفيدون
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fundsLoading ? (
                <LoadingState size="sm" message="" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-accent">
                    {summaryStats.activeBeneficiaries}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    مستفيد نشط
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Funds Allocation */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-xl font-bold">توزيع المصارف</CardTitle>
          </CardHeader>
          <CardContent>
            {fundsLoading ? (
              <CardLoadingSkeleton />
            ) : funds.length === 0 ? (
              <EmptyState
                icon={DollarSign}
                title="لا يوجد صناديق"
                description="لم يتم إضافة أي صناديق بعد"
              />
            ) : (
              <div className="space-y-6">
                {funds.map((fund) => (
                  <div key={fund.id} className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-foreground">{fund.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>المخصص: {Number(fund.allocated_amount).toLocaleString()} ر.س</span>
                          </div>
                          {fund.beneficiaries_count > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{fund.beneficiaries_count} مستفيد</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-bold text-primary">
                          {Number(fund.spent_amount).toLocaleString()} ر.س
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {fund.percentage}% مصروف
                        </div>
                      </div>
                    </div>
                    <Progress value={fund.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Distributions */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-xl font-bold">التوزيعات الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            {distributionsLoading ? (
              <CardLoadingSkeleton />
            ) : distributions.length === 0 ? (
              <EmptyState
                icon={PieChart}
                title="لا يوجد توزيعات"
                description="لا يوجد توزيعات حالياً. قم بإنشاء توزيع جديد."
                actionLabel="توزيع جديد"
                onAction={() => setDistributionDialogOpen(true)}
              />
            ) : (
              <div className="space-y-4">
                {distributions.map((dist) => (
                  <div
                    key={dist.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground">{dist.month}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{new Date(dist.distribution_date).toLocaleDateString('ar-SA')}</span>
                        <span>•</span>
                        <span>{dist.beneficiaries_count} مستفيد</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <div className="text-lg font-bold text-primary">
                          {Number(dist.total_amount).toLocaleString()} ر.س
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          dist.status === "مكتمل"
                            ? "bg-success/10 text-success"
                            : dist.status === "قيد المعالجة"
                            ? "bg-warning/10 text-warning"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {dist.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <DistributionDialog
          open={distributionDialogOpen}
          onOpenChange={setDistributionDialogOpen}
          onDistribute={handleDistribute}
        />

        <SimulationDialog
          open={simulationDialogOpen}
          onOpenChange={setSimulationDialogOpen}
        />
      </div>
    </div>
  );
};

export default Funds;
