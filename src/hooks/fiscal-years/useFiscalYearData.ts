/**
 * Fiscal Year Data Hooks
 * @version 2.8.39
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ClosingPreview, FiscalYearSummary } from "@/types/fiscal-year-closing";

export function useClosingPreview(fiscalYearId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["closing-preview", fiscalYearId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("auto-close-fiscal-year", {
        body: { fiscal_year_id: fiscalYearId, preview_only: true }
      });
      
      if (error) throw error;
      return data as ClosingPreview;
    },
    enabled,
  });
}

export function useFiscalYearSummary(fiscalYearId: string, hasClosing: boolean) {
  return useQuery({
    queryKey: ["fiscal-year-summary", fiscalYearId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("calculate_fiscal_year_summary", {
        p_fiscal_year_id: fiscalYearId,
      });
      if (error) throw error;
      return data as unknown as FiscalYearSummary;
    },
    enabled: !hasClosing,
  });
}
