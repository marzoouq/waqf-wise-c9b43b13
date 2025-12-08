/**
 * useAccountDistribution Hook
 * Hook لجلب بيانات توزيع الحسابات
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AccountingService } from "@/services/accounting.service";
import { supabase } from "@/integrations/supabase/client";

interface AccountDistribution {
  name: string;
  value: number;
  count: number;
}

export function useAccountDistribution() {
  const queryClient = useQueryClient();

  const query = useQuery<AccountDistribution[]>({
    queryKey: ["account-distribution"],
    queryFn: () => AccountingService.getAccountDistribution(),
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    const channel = supabase
      .channel('accounts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts' }, () => {
        queryClient.invalidateQueries({ queryKey: ["account-distribution"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
