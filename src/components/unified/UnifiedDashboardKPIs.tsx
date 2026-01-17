import { memo } from "react";
import { 
  Users, 
  UsersRound, 
  Building2, 
  Wallet, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Home,
  CreditCard,
  PieChart
} from "lucide-react";
import { useUnifiedKPIs } from "@/hooks/dashboard/useUnifiedKPIs";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedSectionHeader } from "@/components/unified/UnifiedSectionHeader";
import { ReportRefreshIndicator } from "@/components/reports/ReportRefreshIndicator";
import { Alert, AlertDescription } from "@/components/ui/alert";

type KPIVariant = 'admin' | 'nazer' | 'accountant' | 'default';

interface UnifiedDashboardKPIsProps {
  variant?: KPIVariant;
  title?: string;
  description?: string;
  showRefreshIndicator?: boolean;
  className?: string;
}

/**
 * مكون KPIs موحد يُستخدم في جميع لوحات التحكم
 * يضمن تطابق الأرقام والبيانات عبر جميع الشاشات
 */
export const UnifiedDashboardKPIs = memo(function UnifiedDashboardKPIs({
  variant = 'default',
  title = "الإحصائيات",
  description = "نظرة شاملة على النظام",
  showRefreshIndicator = true,
  className
}: UnifiedDashboardKPIsProps) {
  const { data: kpis, isLoading, isError, error, isRefetching, refresh, lastUpdated } = useUnifiedKPIs();

  if (isError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          حدث خطأ في جلب البيانات: {error instanceof Error ? error.message : 'خطأ غير معروف'}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !kpis) {
    return (
      <section className={className}>
        <UnifiedSectionHeader title={title} description={description} />
        <UnifiedStatsGrid columns={4}>
          {[...Array(8)].map((_, i) => (
            <UnifiedKPICard 
              key={`skeleton-${i}`}
              title="جاري التحميل..."
              value="..."
              icon={Building2}
              loading={true}
            />
          ))}
        </UnifiedStatsGrid>
      </section>
    );
  }

  // بناء البطاقات حسب نوع لوحة التحكم
  const getKPICards = () => {
    const baseCards = [
      {
        title: "إجمالي المستفيدين",
        value: formatNumber(kpis.totalBeneficiaries),
        icon: Users,
        variant: "default" as const,
        trend: `${kpis.activeBeneficiaries} نشط`,
        show: true
      },
      {
        title: "العائلات",
        value: formatNumber(kpis.totalFamilies),
        icon: UsersRound,
        variant: "default" as const,
        trend: "مسجلة في النظام",
        show: variant === 'admin' || variant === 'default'
      },
      {
        title: "العقارات",
        value: formatNumber(kpis.totalProperties),
        icon: Building2,
        variant: "success" as const,
        trend: `${kpis.occupiedProperties} مؤجر`,
        show: true
      },
      {
        title: "العقارات النشطة",
        value: formatNumber(kpis.activeProperties),
        icon: Home,
        variant: "warning" as const,
        subtitle: "العقارات المسجلة",
        show: variant === 'nazer'
      },
      {
        title: "الأقلام النشطة",
        value: formatNumber(kpis.activeFunds),
        icon: Wallet,
        variant: "warning" as const,
        trend: `من ${kpis.totalFunds} إجمالي`,
        show: variant === 'admin' || variant === 'default'
      },
      {
        title: "الميزانية المتاحة",
        value: kpis.availableBudget > 0 ? formatCurrency(kpis.availableBudget) : '—',
        icon: Wallet,
        variant: "success" as const,
        subtitle: kpis.availableBudget === 0 ? "غير متاح" : undefined,
        show: variant === 'nazer' || variant === 'accountant'
      },
      {
        title: "الطلبات المعلقة",
        value: formatNumber(kpis.pendingRequests),
        icon: Clock,
        variant: "default" as const,
        trend: `${kpis.overdueRequests} متأخر`,
        show: variant === 'admin' || variant === 'default'
      },
      {
        title: "الطلبات المتأخرة",
        value: formatNumber(kpis.overdueRequests),
        icon: AlertCircle,
        variant: "danger" as const,
        trend: "يحتاج معالجة عاجلة",
        show: variant === 'admin' && kpis.overdueRequests > 0
      },
      {
        title: "القروض المستحقة",
        value: formatNumber(kpis.pendingLoans),
        icon: CreditCard,
        variant: "danger" as const,
        subtitle: "القروض النشطة",
        show: variant === 'nazer' || variant === 'accountant'
      },
      {
        title: "إجمالي المحصّل",
        value: kpis.totalRevenue > 0 ? formatCurrency(kpis.totalRevenue) : '—',
        icon: TrendingUp,
        variant: "success" as const,
        trend: variant === 'admin' ? `مصروفات: ${formatCurrency(kpis.totalExpenses)}` : undefined,
        subtitle: kpis.totalRevenue === 0 ? "غير متاح" : "من التحصيل الفعلي",
        show: true
      },
      {
        title: "صافي الدخل",
        value: formatCurrency(kpis.netIncome),
        icon: kpis.netIncome >= 0 ? TrendingUp : TrendingDown,
        variant: kpis.netIncome >= 0 ? "success" as const : "danger" as const,
        trend: "بعد خصم المصروفات",
        show: variant === 'admin' || variant === 'accountant'
      },
      {
        title: "الإيراد الشهري من العقود",
        value: kpis.monthlyReturn > 0 ? formatCurrency(kpis.monthlyReturn) : '—',
        icon: PieChart,
        variant: "default" as const,
        subtitle: kpis.monthlyReturn === 0 ? "غير متاح" : "من العقود النشطة",
        show: variant === 'nazer'
      },
      {
        title: "الإيراد السنوي المتوقع",
        value: kpis.monthlyReturn > 0 ? formatCurrency(kpis.monthlyReturn * 12) : '—',
        icon: TrendingUp,
        variant: "success" as const,
        subtitle: kpis.monthlyReturn === 0 ? "غير متاح" : "تقدير سنوي",
        show: variant === 'nazer'
      },
      {
        title: "إجمالي الأصول",
        value: kpis.totalAssets > 0 ? formatCurrency(kpis.totalAssets) : '—',
        icon: Building2,
        variant: "default" as const,
        subtitle: kpis.totalAssets === 0 ? "غير متاح" : undefined,
        show: variant === 'nazer'
      }
    ];

    return baseCards.filter(card => card.show);
  };

  const cards = getKPICards();

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-4">
        <UnifiedSectionHeader title={title} description={description} />
        {showRefreshIndicator && (
          <ReportRefreshIndicator
            lastUpdated={lastUpdated}
            isRefetching={isRefetching}
            onRefresh={refresh}
          />
        )}
      </div>
      
      <UnifiedStatsGrid columns={4}>
        {cards.map((card) => (
          <UnifiedKPICard 
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            variant={card.variant}
            trend={card.trend}
            subtitle={card.subtitle}
          />
        ))}
      </UnifiedStatsGrid>
    </section>
  );
});
