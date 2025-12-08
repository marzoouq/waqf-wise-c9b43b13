/**
 * useCashFlowCalculation Hook
 * Hook لحساب التدفقات النقدية
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCashFlows } from "./useCashFlows";
import { toast } from "sonner";
import { productionLogger } from "@/lib/logger/production-logger";

export function useCashFlowCalculation() {
  const { cashFlows, isLoading, calculateCashFlow } = useCashFlows();
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const { data: fiscalYear } = await supabase
        .from("fiscal_years")
        .select("*")
        .eq("is_active", true)
        .single();

      if (!fiscalYear) {
        toast.error("لا توجد سنة مالية نشطة");
        return;
      }

      await calculateCashFlow({
        fiscalYearId: fiscalYear.id,
        periodStart: fiscalYear.start_date,
        periodEnd: fiscalYear.end_date,
      });
    } catch (error) {
      productionLogger.error("Error calculating cash flow", error, {
        context: 'CashFlowCalculation',
        severity: 'medium',
      });
      toast.error("حدث خطأ أثناء حساب التدفقات النقدية");
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    cashFlows,
    isLoading,
    isCalculating,
    latestFlow: cashFlows[0],
    handleCalculate,
  };
}
