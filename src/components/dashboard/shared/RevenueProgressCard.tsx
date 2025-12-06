import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useFiscalYears } from "@/hooks/useFiscalYears";

export function RevenueProgressCard() {
  const { fiscalYears } = useFiscalYears();
  const activeFiscalYear = fiscalYears.find(fy => fy.is_active);

  const { data, isLoading } = useQuery({
    queryKey: ["revenue-progress", activeFiscalYear?.id],
    queryFn: async () => {
      if (!activeFiscalYear) return null;

      // جلب الإيرادات المحصلة
      const { data: payments } = await supabase
        .from("rental_payments")
        .select("amount_due, tax_amount")
        .eq("status", "مدفوع")
        .gte("payment_date", activeFiscalYear.start_date)
        .lte("payment_date", activeFiscalYear.end_date);

      const totalCollected = payments?.reduce((sum, p) => sum + (p.amount_due || 0), 0) || 0;
      const totalTax = payments?.reduce((sum, p) => sum + (p.tax_amount || 0), 0) || 0;
      const netRevenue = totalCollected - totalTax;

      // جلب إجمالي الإيجارات السنوية من العقود النشطة (monthly_rent * 12)
      const { data: contracts } = await supabase
        .from("contracts")
        .select("monthly_rent, payment_frequency")
        .eq("status", "active");

      // حساب الإيجار السنوي بناءً على الدورية
      const expectedRevenue = contracts?.reduce((sum, c) => {
        const monthlyRent = c.monthly_rent || 0;
        return sum + (monthlyRent * 12);
      }, 0) || 0;

      const progress = expectedRevenue > 0 ? (totalCollected / expectedRevenue) * 100 : 0;

      return {
        totalCollected,
        netRevenue,
        totalTax,
        expectedRevenue,
        progress: Math.min(progress, 100),
      };
    },
    enabled: !!activeFiscalYear,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="border-l-4 border-l-[hsl(var(--chart-2))]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[hsl(var(--chart-2))]" />
          تقدم الإيرادات للسنة المالية
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">نسبة التحصيل</span>
            <span className="font-bold text-[hsl(var(--chart-2))]">{data.progress.toFixed(1)}%</span>
          </div>
          <Progress value={data.progress} className="h-3" />
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-2 bg-[hsl(var(--chart-2))]/10 rounded-lg">
            <Wallet className="h-4 w-4 mx-auto mb-1 text-[hsl(var(--chart-2))]" />
            <span className="text-sm font-bold block">{data.totalCollected.toLocaleString('ar-SA')}</span>
            <span className="text-xs text-muted-foreground">المحصل</span>
          </div>
          <div className="text-center p-2 bg-primary/10 rounded-lg">
            <Target className="h-4 w-4 mx-auto mb-1 text-primary" />
            <span className="text-sm font-bold block">{data.expectedRevenue.toLocaleString('ar-SA')}</span>
            <span className="text-xs text-muted-foreground">المتوقع</span>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <span className="text-sm font-bold block">{data.netRevenue.toLocaleString('ar-SA')}</span>
            <span className="text-xs text-muted-foreground">الصافي</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
