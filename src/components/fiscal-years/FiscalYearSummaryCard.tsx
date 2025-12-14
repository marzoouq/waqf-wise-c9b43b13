/**
 * بطاقة ملخص السنة المالية
 * Fiscal Year Summary Card
 */

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Users, DollarSign, Receipt, Coins } from "lucide-react";
import type { FiscalYearClosing } from "@/types/fiscal-year-closing";
import { useFiscalYearSummary } from "@/hooks/fiscal-years/useFiscalYearData";
import { ErrorState } from "@/components/shared/ErrorState";

interface FiscalYearSummaryCardProps {
  fiscalYearId: string;
  closing?: FiscalYearClosing | null;
}

export function FiscalYearSummaryCard({ fiscalYearId, closing }: FiscalYearSummaryCardProps) {
  // حساب الملخص إذا لم يكن هناك إقفال
  const { data: summary, isLoading, error, refetch } = useFiscalYearSummary(fiscalYearId, !!closing);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في التحميل" message="فشل تحميل ملخص السنة المالية" onRetry={refetch} />;
  }

  // استخدام بيانات الإقفال إن وجدت، وإلا استخدام الملخص المحسوب
  const data = closing || summary;
  if (!data) return null;

  const stats = [
    {
      label: "إجمالي الإيرادات",
      value: closing?.total_revenues || summary?.total_revenues || 0,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "إجمالي المصروفات",
      value: closing?.total_expenses || summary?.total_expenses || 0,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "صافي الدخل",
      value: closing?.net_income || 
             ((summary?.total_revenues || 0) - (summary?.total_expenses || 0)),
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "ضريبة القيمة المضافة",
      value: closing?.total_vat_collected || summary?.vat_collected || 0,
      icon: Receipt,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "توزيعات المستفيدين",
      value: closing?.total_beneficiary_distributions || 
             summary?.beneficiary_distributions || 0,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "رقبة الوقف",
      value: closing?.waqf_corpus || 0,
      icon: Coins,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">
                    {stat.value.toLocaleString("ar-SA")}
                    <span className="text-sm font-normal text-muted-foreground mr-1">
                      ر.س
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
