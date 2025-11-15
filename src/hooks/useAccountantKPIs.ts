import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_CONFIG } from "@/lib/queryOptimization";

export interface AccountantKPIs {
  pendingApprovals: number;
  draftEntries: number;
  postedEntries: number;
  cancelledEntries: number;
  todayEntries: number;
  monthlyTotal: number;
}

export function useAccountantKPIs() {
  return useQuery({
    queryKey: ["accountant-kpis"],
    queryFn: async (): Promise<AccountantKPIs> => {
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const monthStart = startOfMonth.toISOString().split('T')[0];

      const [
        approvalsRes,
        draftRes,
        postedRes,
        cancelledRes,
        todayRes,
        monthlyRes
      ] = await Promise.all([
        supabase.from('approvals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('journal_entries').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('journal_entries').select('*', { count: 'exact', head: true }).eq('status', 'posted'),
        supabase.from('journal_entries').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
        supabase.from('journal_entries').select('*', { count: 'exact', head: true }).eq('entry_date', today),
        supabase.from('journal_entries').select('*', { count: 'exact', head: true }).gte('entry_date', monthStart)
      ]);

      return {
        pendingApprovals: approvalsRes.count || 0,
        draftEntries: draftRes.count || 0,
        postedEntries: postedRes.count || 0,
        cancelledEntries: cancelledRes.count || 0,
        todayEntries: todayRes.count || 0,
        monthlyTotal: monthlyRes.count || 0,
      };
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchOnWindowFocus: true,
  });
}
