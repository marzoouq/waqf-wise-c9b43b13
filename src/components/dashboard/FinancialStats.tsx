import { TrendingUp, TrendingDown, Wallet, PiggyBank, Calculator } from "lucide-react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { formatCurrency } from "@/lib/utils";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";

const FinancialStats = () => {
  const { data, isLoading } = useFinancialData();

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

  if (!data) return null;

  const stats = [
    {
      title: "إجمالي الأصول",
      value: "—",
      icon: Wallet,
      variant: "default" as const,
      trend: "غير متاح",
    },
    {
      title: "إجمالي الالتزامات",
      value: "—",
      icon: Calculator,
      variant: "warning" as const,
      trend: "غير متاح",
    },
    {
      title: "حقوق الملكية",
      value: "—",
      icon: PiggyBank,
      variant: "default" as const,
      trend: "غير متاح",
    },
    {
      title: "إجمالي الإيرادات",
      value: "—",
      icon: TrendingUp,
      variant: "success" as const,
      trend: "غير متاح",
    },
    {
      title: "إجمالي المصروفات",
      value: "—",
      icon: TrendingDown,
      variant: "danger" as const,
      trend: "غير متاح",
    },
    {
      title: "صافي الدخل",
      value: "—",
      icon: TrendingUp,
      variant: "default" as const,
      trend: "غير متاح",
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
          trend={stat.trend}
          variant={stat.variant}
        />
      ))}
    </UnifiedStatsGrid>
  );
};

export default FinancialStats;
