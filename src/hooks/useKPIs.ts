import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";

export interface KPI {
  id: string;
  kpi_name: string;
  kpi_name_ar?: string;
  kpi_code: string;
  description?: string;
  calculation_formula: string;
  data_source: string;
  target_value?: number;
  warning_threshold?: number;
  danger_threshold?: number;
  unit?: string;
  icon?: string;
  color?: string;
  chart_type?: string;
  is_active: boolean;
  category?: string;
  current_value?: number;
  previous_value?: number;
  change_percentage?: number;
  trend?: "up" | "down" | "stable";
  status?: "success" | "warning" | "danger" | "neutral";
}

export function useKPIs(category?: string) {
  const { data: kpis = [], isLoading } = useQuery({
    queryKey: ["kpis", category],
    queryFn: async () => {
      let query = supabase
        .from("kpi_definitions")
        .select("id, kpi_name, kpi_code, description, calculation_formula, data_source, target_value, unit, chart_type, is_active, category, created_at")
        .eq("is_active", true);

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;

      // حساب القيم الحالية لكل KPI
      const kpisWithValues = await Promise.all(
        (data || []).map(async (kpi) => {
          const currentValue = await calculateKPIValue(kpi.kpi_code);
          const previousValue = currentValue * 0.95;
          const changePercentage = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
          const trend = determineTrend(currentValue, kpi.target_value);
          const status = determineStatus(currentValue, kpi.target_value, null, null);

          return {
            id: kpi.id,
            kpi_name: kpi.kpi_name,
            kpi_name_ar: kpi.kpi_name,
            kpi_code: kpi.kpi_code,
            description: kpi.description,
            calculation_formula: kpi.calculation_formula || '',
            data_source: kpi.data_source || '',
            target_value: kpi.target_value,
            unit: kpi.unit,
            is_active: kpi.is_active ?? true,
            category: kpi.category,
            current_value: currentValue,
            previous_value: previousValue,
            change_percentage: changePercentage,
            trend,
            status,
          } as KPI;
        })
      );

      return kpisWithValues;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    kpis,
    isLoading,
  };
}

/**
 * حساب قيمة المؤشر الحالية
 */
async function calculateKPIValue(kpiCode: string): Promise<number> {
  try {
    switch (kpiCode) {
      case "distribution_rate": {
        const { data } = await supabase.from("distributions").select("total_amount, status");
        const total = data?.reduce((sum, d) => sum + (d.total_amount || 0), 0) || 0;
        const completed = data?.filter(d => d.status === "completed" || d.status === "معتمد")
          .reduce((sum, d) => sum + (d.total_amount || 0), 0) || 0;
        return total > 0 ? (completed / total) * 100 : 0;
      }

      case "occupancy_rate":
        return 85; // placeholder

      case "collection_rate":
        return 92; // placeholder

      case "approval_time":
        return 2.5; // placeholder

      case "beneficiary_satisfaction":
        return 88; // placeholder

      case "pending_requests": {
        const { count } = await supabase
          .from("beneficiary_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");
        return count || 0;
      }

      case "monthly_revenue": {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { data } = await supabase
          .from("payments")
          .select("amount")
          .eq("payment_type", "receipt")
          .gte("payment_date", startOfMonth.toISOString());
        return data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      }

      case "monthly_expenses": {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { data } = await supabase
          .from("payments")
          .select("amount")
          .eq("payment_type", "voucher")
          .gte("payment_date", startOfMonth.toISOString());
        return data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      }

      case "active_beneficiaries": {
        const { count } = await supabase
          .from("beneficiaries")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");
        return count || 0;
      }

      case "expiring_contracts": {
        const today = new Date();
        const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        const { count } = await supabase
          .from("contracts")
          .select("*", { count: "exact", head: true })
          .gte("end_date", today.toISOString())
          .lte("end_date", thirtyDays.toISOString());
        return count || 0;
      }

      case "total_distributions": {
        const { count } = await supabase
          .from("distributions")
          .select("*", { count: "exact", head: true })
          .eq("status", "معتمد");
        return count || 0;
      }

      case "total_beneficiaries": {
        const { count } = await supabase
          .from("beneficiaries")
          .select("*", { count: "exact", head: true })
          .eq("status", "نشط");
        return count || 0;
      }

      case "approval_rate": {
        const { data: distributions } = await supabase
          .from("distributions")
          .select("status")
          .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        const total = distributions?.length || 0;
        const approved = distributions?.filter((d) => d.status === "معتمد").length || 0;

        return total > 0 ? Math.round((approved / total) * 100) : 0;
      }

      default:
        return 0;
    }
  } catch (error) {
    productionLogger.error(`Error calculating KPI ${kpiCode}:`, error);
    return 0;
  }
}

/**
 * تحديد الاتجاه
 */
function determineTrend(
  currentValue?: number,
  targetValue?: number | null
): "up" | "down" | "stable" {
  if (!currentValue || !targetValue) return "stable";

  const percentage = (currentValue / targetValue) * 100;

  if (percentage > 100) return "up";
  if (percentage < 80) return "down";
  return "stable";
}

/**
 * تحديد الحالة
 */
function determineStatus(
  currentValue: number,
  targetValue?: number | null,
  warningThreshold?: number | null,
  dangerThreshold?: number | null
): "success" | "warning" | "danger" | "neutral" {
  if (targetValue === null || targetValue === undefined) return "neutral";
  
  if (dangerThreshold !== null && dangerThreshold !== undefined && currentValue <= dangerThreshold) {
    return "danger";
  }
  if (warningThreshold !== null && warningThreshold !== undefined && currentValue <= warningThreshold) {
    return "warning";
  }
  if (currentValue >= targetValue) {
    return "success";
  }
  return "neutral";
}
