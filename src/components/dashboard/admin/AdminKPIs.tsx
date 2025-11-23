import { memo, useMemo } from "react";
import { Users, UsersRound, Building2, Wallet, AlertCircle, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminKPIs } from "@/hooks/useAdminKPIs";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber } from "@/lib/utils";

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
        color: "text-primary",
        bgColor: "bg-primary/10",
        trend: `${calculateTrend(kpis.activeBeneficiaries, kpis.totalBeneficiaries)}% نشط`,
        trendUp: true,
      },
      {
        title: "العائلات",
        value: formatNumber(kpis.totalFamilies),
        icon: UsersRound,
        color: "text-info",
        bgColor: "bg-info/10",
        trend: "مسجلة في النظام",
        trendUp: true,
      },
      {
        title: "العقارات",
        value: formatNumber(kpis.totalProperties),
        icon: Building2,
        color: "text-success",
        bgColor: "bg-success/10",
        trend: `${kpis.occupiedProperties} مؤجر`,
        trendUp: true,
      },
      {
        title: "الأقلام النشطة",
        value: formatNumber(kpis.activeFunds),
        icon: Wallet,
        color: "text-warning",
        bgColor: "bg-warning/10",
        trend: `من ${kpis.totalFunds} إجمالي`,
        trendUp: true,
      },
      {
        title: "الطلبات المعلقة",
        value: formatNumber(kpis.pendingRequests),
        icon: Clock,
        color: "text-info",
        bgColor: "bg-info/10",
        trend: `${kpis.overdueRequests} متأخر`,
        trendUp: false,
      },
      {
        title: "الطلبات المتأخرة",
        value: formatNumber(kpis.overdueRequests),
        icon: AlertCircle,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        trend: "يحتاج معالجة عاجلة",
        trendUp: false,
      },
      {
        title: "إجمالي الإيرادات",
        value: formatCurrency(kpis.totalRevenue),
        icon: TrendingUp,
        color: "text-success",
        bgColor: "bg-success/10",
        trend: "السنة الحالية",
        trendUp: true,
      },
      {
        title: kpis.netIncome >= 0 ? "صافي الربح" : "صافي الخسارة",
        value: formatCurrency(Math.abs(kpis.netIncome)),
        icon: kpis.netIncome >= 0 ? TrendingUp : TrendingDown,
        color: kpis.netIncome >= 0 ? "text-success" : "text-destructive",
        bgColor: kpis.netIncome >= 0 ? "bg-success/10" : "bg-destructive/10",
        trend: `بعد خصم ${formatCurrency(kpis.totalExpenses)}`,
        trendUp: kpis.netIncome >= 0,
      },
    ];
  }, [kpis]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="shadow-soft" style={{ minHeight: '140px' }}>
            <CardHeader className="pb-2 sm:pb-3">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!kpis || stats.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="shadow-soft hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
            style={{ minHeight: '140px' }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
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
});

AdminKPIs.displayName = 'AdminKPIs';
