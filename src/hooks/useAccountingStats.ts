import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_CONFIG } from "@/lib/queryOptimization";

export interface AccountingStats {
  totalEntries: number;
  postedEntries: number;
  draftEntries: number;
  cancelledEntries: number;
}

export function useAccountingStats() {
  return useQuery({
    queryKey: ["accounting-stats"],
    queryFn: async (): Promise<AccountingStats> => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("id, status");

      if (error) throw error;

      const totalEntries = data?.length || 0;
      const postedEntries = data?.filter(e => e.status === "posted").length || 0;
      const draftEntries = data?.filter(e => e.status === "draft").length || 0;
      const cancelledEntries = data?.filter(e => e.status === "cancelled").length || 0;

      return {
        totalEntries,
        postedEntries,
        draftEntries,
        cancelledEntries,
      };
    },
    ...QUERY_CONFIG.CHARTS,
  });
}
