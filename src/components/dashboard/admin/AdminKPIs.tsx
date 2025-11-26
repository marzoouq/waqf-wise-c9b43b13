import { memo, useMemo } from "react";
import { Users, UsersRound, Building2, Wallet, AlertCircle, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useAdminKPIs } from "@/hooks/useAdminKPIs";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";

export const AdminKPIs = memo(() => {
  const { data: kpis, isLoading } = useAdminKPIs();

  const stats = useMemo(() => {
    if (!kpis) return [];

    const calculateTrend = (current: number, total: number) => {
      if (total === 0) return 0;
      return ((current / total) * 100).toFixed(1);
    };

    return [
      {
        title: "إجمالي المستفيدين",
        value: formatNumber(kpis.totalBeneficiaries),
        icon: Users,
        variant: "default" as const,
        trend: `${calculateTrend(kpis.activeBeneficiaries, kpis.totalBeneficiaries)}% نشط`,
      },
      {
        title: "العائلات",
        value: formatNumber(kpis.totalFamilies),
        icon: UsersRound,
        variant: "default" as const,
        trend: "مسجلة في النظام",
      },
      {
        title: "العقارات",
        value: formatNumber(kpis.totalProperties),
        icon: Building2,
        variant: "success" as const,
        trend: `${kpis.occupiedProperties} مؤجر`,
      },
      {
        title: "الأقلام النشطة",
        value: formatNumber(kpis.activeFunds),
        icon: Wallet,
        variant: "warning" as const,
        trend: `من ${kpis.totalFunds} إجمالي`,
      },
      {
        title: "الطلبات المعلقة",
        value: formatNumber(kpis.pendingRequests),
        icon: Clock,
        variant: "default" as const,
        trend: `${kpis.overdueRequests} متأخر`,
      },
      {
        title: "الطلبات المتأخرة",
        value: formatNumber(kpis.overdueRequests),
        icon: AlertCircle,
        variant: "danger" as const,
        trend: "يحتاج معالجة عاجلة",
      },
      {
        title: "إجمالي الإيرادات",
        value: formatCurrency(kpis.totalRevenue),
        icon: TrendingUp,
        variant: "success" as const,
        trend: "السنة الحالية",
      },
      {
        title: kpis.netIncome >= 0 ? "صافي الربح" : "صافي الخسارة",
        value: formatCurrency(Math.abs(kpis.netIncome)),
        icon: kpis.netIncome >= 0 ? TrendingUp : TrendingDown,
        variant: kpis.netIncome >= 0 ? ("success" as const) : ("danger" as const),
        trend: `بعد خصم ${formatCurrency(kpis.totalExpenses)}`,
      },
    ];
  }, [kpis]);

  if (isLoading) {
    return (
      <UnifiedStatsGrid>
        {[...Array(8)].map((_, i) => (
          <UnifiedKPICard
            key={i}
            title=""
            value="0"
            icon={Users}
            loading={true}
          />
        ))}
      </UnifiedStatsGrid>
    );
  }

  if (!kpis || stats.length === 0) return null;

  return (
    <UnifiedStatsGrid className="mb-8">
      {stats.map((stat, index) => (
        <UnifiedKPICard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          trend={stat.trend}
          variant={stat.variant}
        />
      ))}
    </UnifiedStatsGrid>
  );
});

AdminKPIs.displayName = 'AdminKPIs';
