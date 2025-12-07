/**
 * useRevenueProgress Hook
 * نقل منطق حساب تقدم الإيرادات من UI إلى Hook
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActiveFiscalYear } from "@/hooks/fiscal-years";
import { QUERY_CONFIG } from "@/lib/queryOptimization";

export interface RevenueProgressData {
  totalCollected: number;
  netRevenue: number;
  totalTax: number;
  expectedRevenue: number;
  progress: number;
}

export function useRevenueProgress() {
  const { activeFiscalYear, isLoading: fiscalYearLoading } = useActiveFiscalYear();

  const query = useQuery({
    queryKey: ["revenue-progress", activeFiscalYear?.id],
    queryFn: async (): Promise<RevenueProgressData | null> => {
      if (!activeFiscalYear) return null;

      // تنفيذ الاستعلامات بشكل متوازي
      const [paymentsResult, contractsResult] = await Promise.all([
        // جلب الإيرادات المحصلة
        supabase
          .from("rental_payments")
          .select("amount_due, tax_amount")
          .eq("status", "مدفوع")
          .gte("payment_date", activeFiscalYear.start_date)
          .lte("payment_date", activeFiscalYear.end_date),
        
        // جلب إجمالي الإيجارات السنوية من العقود النشطة
        supabase
          .from("contracts")
          .select("monthly_rent, payment_frequency")
          .eq("status", "active"),
      ]);

      const payments = paymentsResult.data || [];
      const contracts = contractsResult.data || [];

      // حساب الإيرادات
      const totalCollected = payments.reduce((sum, p) => sum + (p.amount_due || 0), 0);
      const totalTax = payments.reduce((sum, p) => sum + (p.tax_amount || 0), 0);
      const netRevenue = totalCollected - totalTax;

      // حساب الإيجار السنوي المتوقع
      const expectedRevenue = contracts.reduce((sum, c) => {
        const monthlyRent = c.monthly_rent || 0;
        return sum + (monthlyRent * 12);
      }, 0);

      // حساب نسبة التقدم
      const progress = expectedRevenue > 0 
        ? Math.min((totalCollected / expectedRevenue) * 100, 100) 
        : 0;

      return {
        totalCollected,
        netRevenue,
        totalTax,
        expectedRevenue,
        progress,
      };
    },
    enabled: !!activeFiscalYear,
    ...QUERY_CONFIG.DASHBOARD_KPIS,
  });

  return {
    data: query.data,
    isLoading: query.isLoading || fiscalYearLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
