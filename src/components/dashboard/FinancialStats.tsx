import { TrendingUp, TrendingDown, Wallet, PiggyBank, Calculator } from "lucide-react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { formatCurrency } from "@/lib/utils";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { ErrorState } from "@/components/shared/ErrorState";

const FinancialStats = () => {
  const { data, isLoading, error, refetch } = useFinancialData();

  if (isLoading) {
    return (
      <UnifiedStatsGrid columns={3}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <UnifiedKPICard
            key={`skeleton-${i}`}
            title=""
            value="0"
            icon={Wallet}
            loading={true}
          />
        ))}
      </UnifiedStatsGrid>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل البيانات المالية" message={(error as Error).message} onRetry={refetch} />;
  }

  if (!data) return null;

  const stats = [
    {
      title: "إجمالي الأصول",
      value: formatCurrency(data.totalAssets),
      icon: Wallet,
      variant: "default" as const,
    },
    {
      title: "إجمالي الالتزامات",
      value: formatCurrency(data.totalLiabilities),
      icon: Calculator,
      variant: "warning" as const,
    },
    {
      title: "حقوق الملكية",
      value: formatCurrency(data.totalEquity),
      icon: PiggyBank,
      variant: "default" as const,
    },
    {
      title: "إجمالي الإيرادات",
      value: formatCurrency(data.totalRevenue),
      icon: TrendingUp,
      variant: "success" as const,
    },
    {
      title: "إجمالي المصروفات",
      value: formatCurrency(data.totalExpenses),
      icon: TrendingDown,
      variant: "danger" as const,
    },
    {
      title: "صافي الدخل",
      value: formatCurrency(data.netIncome),
      icon: TrendingUp,
      variant: data.netIncome >= 0 ? "success" as const : "danger" as const,
    },
  ];

  return (
    <UnifiedStatsGrid columns={3}>
      {stats.map((stat) => (
        <UnifiedKPICard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          variant={stat.variant}
        />
      ))}
    </UnifiedStatsGrid>
  );
};

export default FinancialStats;
