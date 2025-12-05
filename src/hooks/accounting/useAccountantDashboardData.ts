/**
 * Hook for AccountantDashboard data fetching
 * يجلب بيانات الموافقات المعلقة للمحاسب
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { JournalApproval } from "@/types/approvals";

export function useAccountantDashboardData() {
  const {
    data: pendingApprovals = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pending_approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approvals")
        .select(`
          *,
          journal_entry:journal_entries(*)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as JournalApproval[];
    },
  });

  return {
    pendingApprovals,
    isLoading,
    error,
  };
}
