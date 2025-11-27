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
      value: formatCurrency(data.totalAssets),
      icon: Wallet,
      variant: "default" as const,
      trend: "القيمة الدفترية",
    },
    {
      title: "إجمالي الالتزامات",
      value: formatCurrency(data.totalLiabilities),
      icon: Calculator,
      variant: "warning" as const,
      trend: "المستحقات",
    },
    {
      title: "حقوق الملكية",
      value: formatCurrency(data.totalEquity),
      icon: PiggyBank,
      variant: "default" as const,
      trend: "الصافي",
    },
    {
      title: "إجمالي الإيرادات",
      value: formatCurrency(data.totalRevenue),
      icon: TrendingUp,
      variant: "success" as const,
      trend: "الفترة الحالية",
    },
    {
      title: "إجمالي المصروفات",
      value: formatCurrency(data.totalExpenses),
      icon: TrendingDown,
      variant: "danger" as const,
      trend: "الفترة الحالية",
    },
    {
      title: data.netIncome >= 0 ? "صافي الربح" : "صافي الخسارة",
      value: formatCurrency(Math.abs(data.netIncome)),
      icon: data.netIncome >= 0 ? TrendingUp : TrendingDown,
      variant: data.netIncome >= 0 ? ("success" as const) : ("danger" as const),
      trend: data.netIncome >= 0 ? "أداء إيجابي" : "يحتاج مراجعة",
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
