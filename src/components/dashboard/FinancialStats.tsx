import { useState } from "react";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Calculator, Calendar, Lock, Unlock } from "lucide-react";
import { useFinancialData, useFiscalYearOptions } from "@/hooks/accounting/useFinancialData";
import { formatCurrency } from "@/lib/utils";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { ErrorState } from "@/components/shared/ErrorState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const FinancialStats = () => {
  const [selectedFiscalYearId, setSelectedFiscalYearId] = useState<string | undefined>(undefined);
  const { data: fiscalYears = [], isLoading: isLoadingYears } = useFiscalYearOptions();
  const { data, isLoading, error, refetch } = useFinancialData(selectedFiscalYearId);

  if (isLoading || isLoadingYears) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted/50 rounded animate-pulse w-64" />
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
      </div>
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
    <div className="space-y-4">
      {/* فلتر السنة المالية مع عرض الحالة */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">السنة المالية:</span>
        </div>
        
        <Select
          value={selectedFiscalYearId || data.fiscalYearId || ""}
          onValueChange={(value) => setSelectedFiscalYearId(value || undefined)}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="اختر السنة المالية" />
          </SelectTrigger>
          <SelectContent>
            {fiscalYears.map((fy) => (
              <SelectItem key={fy.id} value={fy.id}>
                <div className="flex items-center gap-2">
                  {fy.is_closed ? (
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <Unlock className="h-3 w-3 text-green-500" />
                  )}
                  <span>{fy.name}</span>
                  {fy.is_active && (
                    <Badge variant="secondary" className="text-xs">نشطة</Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* شارة حالة السنة المالية */}
        {data.fiscalYearName && (
          <Badge 
            variant={data.fiscalYearStatus === 'closed' ? 'secondary' : 'default'}
            className="flex items-center gap-1"
          >
            {data.fiscalYearStatus === 'closed' ? (
              <>
                <Lock className="h-3 w-3" />
                سنة مغلقة
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3" />
                سنة نشطة
              </>
            )}
          </Badge>
        )}
      </div>

      {/* بطاقات الإحصائيات المالية */}
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
    </div>
  );
};

export default FinancialStats;
