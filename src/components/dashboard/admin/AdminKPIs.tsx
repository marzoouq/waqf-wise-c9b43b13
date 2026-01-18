import { memo, useMemo } from "react";
import { Users, UsersRound, Building2, Wallet, AlertCircle, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useUnifiedKPIs } from "@/hooks/dashboard/useUnifiedKPIs";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { ErrorState } from "@/components/shared/ErrorState";

export const AdminKPIs = memo(() => {
  const { data, isLoading, isError, refresh } = useUnifiedKPIs();
  
  // تحويل البيانات الموحدة لصيغة KPIs المشرف
  const kpis = data ? {
    totalBeneficiaries: data.totalBeneficiaries,
    activeBeneficiaries: data.activeBeneficiaries,
    totalFamilies: data.totalFamilies,
    totalProperties: data.totalProperties,
    occupiedProperties: data.occupiedProperties,
    totalFunds: data.totalFunds,
    activeFunds: data.activeFunds,
    pendingRequests: data.pendingRequests,
    overdueRequests: data.overdueRequests,
    totalRevenue: data.totalRevenue,
    totalExpenses: data.totalExpenses,
    netIncome: data.netIncome,
  } : undefined;

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
        title: "إجمالي المحصّل",
        value: formatCurrency(kpis.totalRevenue),
        icon: TrendingUp,
        variant: "success" as const,
        trend: `مصروفات: ${formatCurrency(kpis.totalExpenses)}`,
      },
      {
        title: "صافي الدخل",
        value: formatCurrency(kpis.netIncome),
        icon: kpis.netIncome >= 0 ? TrendingUp : TrendingDown,
        variant: kpis.netIncome >= 0 ? "success" as const : "danger" as const,
        trend: "بعد خصم المصروفات",
      },
    ];
  }, [kpis]);

  if (isLoading) {
    return (
      <UnifiedStatsGrid>
        {[...Array(8)].map((_, i) => (
          <UnifiedKPICard
            key={`skeleton-${i}`}
            title=""
            value="0"
            icon={Users}
            loading={true}
          />
        ))}
      </UnifiedStatsGrid>
    );
  }

  if (isError) {
    return <ErrorState title="خطأ في التحميل" message="فشل تحميل إحصائيات المشرف" onRetry={refresh} />;
  }

  if (!kpis || stats.length === 0) {
    return (
      <div className="p-6 text-center border rounded-lg bg-card">
        <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">لا توجد بيانات KPIs متاحة حالياً</p>
      </div>
    );
  }

  return (
    <UnifiedStatsGrid className="mb-8">
      {stats.map((stat) => (
        <UnifiedKPICard
          key={stat.title}
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
