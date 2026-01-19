import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, PieChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Distribution } from "@/hooks/distributions/useDistributions";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";

interface OverviewTabProps {
  summaryStats: {
    totalAllocated: number;
    totalSpent: number;
    totalAvailable: number;
    activeWaqfUnits: number;
    totalAnnualReturn: number;
  };
  distributions: Distribution[];
}

export function OverviewTab({ summaryStats, distributions }: OverviewTabProps) {
  const spendingPercentage = summaryStats.totalAllocated > 0
    ? (summaryStats.totalSpent / summaryStats.totalAllocated) * 100
    : 0;

  const totalDistributed = distributions.reduce((sum, d) => sum + (d.distributable_amount || 0), 0);
  const totalBeneficiaries = distributions.reduce((sum, d) => sum + d.beneficiaries_count, 0);

  return (
    <div className="space-y-6">
      {/* إحصائيات الأموال */}
      <UnifiedStatsGrid columns={{ sm: 2, md: 3, lg: 5 }}>
        <UnifiedKPICard
          title="إجمالي المخصص"
          value={`${summaryStats.totalAllocated.toLocaleString()} ريال`}
          icon={DollarSign}
          variant="default"
        />
        <UnifiedKPICard
          title="المصروف"
          value={`${summaryStats.totalSpent.toLocaleString()} ريال`}
          subtitle={`${spendingPercentage.toFixed(0)}% من المخصص`}
          icon={TrendingUp}
          variant="warning"
        />
        <UnifiedKPICard
          title="المتاح"
          value={`${summaryStats.totalAvailable.toLocaleString()} ريال`}
          icon={PieChart}
          variant="info"
        />
        <UnifiedKPICard
          title="أقلام الوقف النشطة"
          value={summaryStats.activeWaqfUnits}
          subtitle="قلم وقف"
          icon={PieChart}
          variant="default"
        />
        <UnifiedKPICard
          title="العائد السنوي المتوقع"
          value={`${summaryStats.totalAnnualReturn.toLocaleString()} ريال`}
          subtitle="من العقود النشطة"
          icon={TrendingUp}
          variant="success"
        />
      </UnifiedStatsGrid>

      {/* إحصائيات التوزيعات */}
      <UnifiedStatsGrid columns={3}>
        <UnifiedKPICard
          title="إجمالي التوزيعات"
          value={distributions.length}
          subtitle="عدد التوزيعات المسجلة"
          icon={TrendingUp}
          variant="default"
        />
        <UnifiedKPICard
          title="المبلغ الموزع"
          value={`${totalDistributed.toLocaleString()} ريال`}
          icon={DollarSign}
          variant="success"
        />
        <UnifiedKPICard
          title="المستفيدون"
          value={totalBeneficiaries}
          subtitle="إجمالي المستفيدين"
          icon={Users}
          variant="info"
        />
      </UnifiedStatsGrid>
    </div>
  );
}
