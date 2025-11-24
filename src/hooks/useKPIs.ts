import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface KPI {
  id: string;
  kpi_name: string;
  kpi_code: string;
  description?: string;
  calculation_formula: string;
  data_source: string;
  target_value?: number;
  unit?: string;
  chart_type?: string;
  is_active: boolean;
  category?: string;
  current_value?: number;
  trend?: "up" | "down" | "stable";
}

export function useKPIs(category?: string) {
  const { data: kpis = [], isLoading } = useQuery({
    queryKey: ["kpis", category],
    queryFn: async () => {
      let query = supabase
        .from("kpi_definitions")
        .select("*")
        .eq("is_active", true)
        .order("kpi_name");

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;

      // حساب القيم الحالية لكل KPI
      const kpisWithValues = await Promise.all(
        (data || []).map(async (kpi) => {
          const currentValue = await calculateKPIValue(kpi.kpi_code);
          return {
            ...kpi,
            current_value: currentValue,
            trend: determineTrend(currentValue, kpi.target_value),
          } as KPI;
        })
      );

      return kpisWithValues;
    },
    refetchInterval: 5 * 60 * 1000, // تحديث كل 5 دقائق
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
    console.error(`Error calculating KPI ${kpiCode}:`, error);
    return 0;
  }
}

/**
 * تحديد الاتجاه
 */
function determineTrend(
  currentValue?: number,
  targetValue?: number
): "up" | "down" | "stable" {
  if (!currentValue || !targetValue) return "stable";

  const percentage = (currentValue / targetValue) * 100;

  if (percentage > 100) return "up";
  if (percentage < 80) return "down";
  return "stable";
}
