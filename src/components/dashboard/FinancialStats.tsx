import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Calculator } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFinancialData } from "@/hooks/useFinancialData";
import { formatCurrency } from "@/lib/utils";

const FinancialStats = () => {
  const { data, isLoading } = useFinancialData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={`skeleton-${i}`}>
            <CardHeader className="pb-2">
              <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 sm:h-8 w-32 sm:w-40 mb-1 sm:mb-2" />
              <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      title: "إجمالي الأصول",
      value: formatCurrency(data.totalAssets),
      icon: Wallet,
      color: "text-primary",
      bgColor: "bg-primary/10",
      trend: "القيمة الدفترية",
      trendUp: true,
    },
    {
      title: "إجمالي الالتزامات",
      value: formatCurrency(data.totalLiabilities),
      icon: Calculator,
      color: "text-warning",
      bgColor: "bg-warning/10",
      trend: "المستحقات",
      trendUp: false,
    },
    {
      title: "حقوق الملكية",
      value: formatCurrency(data.totalEquity),
      icon: PiggyBank,
      color: "text-info",
      bgColor: "bg-info/10",
      trend: "الصافي",
      trendUp: true,
    },
    {
      title: "إجمالي الإيرادات",
      value: formatCurrency(data.totalRevenue),
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
      trend: "الفترة الحالية",
      trendUp: true,
    },
    {
      title: "إجمالي المصروفات",
      value: formatCurrency(data.totalExpenses),
      icon: TrendingDown,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      trend: "الفترة الحالية",
      trendUp: false,
    },
    {
      title: data.netIncome >= 0 ? "صافي الربح" : "صافي الخسارة",
      value: formatCurrency(Math.abs(data.netIncome)),
      icon: data.netIncome >= 0 ? TrendingUp : TrendingDown,
      color: data.netIncome >= 0 ? "text-success" : "text-destructive",
      bgColor: data.netIncome >= 0 ? "bg-success/10" : "bg-destructive/10",
      trend: data.netIncome >= 0 ? "أداء إيجابي" : "يحتاج مراجعة",
      trendUp: data.netIncome >= 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer group animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                {stat.value}
              </div>
              <div className="flex items-center gap-1 text-sm">
                {stat.trendUp ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-muted-foreground">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default FinancialStats;
