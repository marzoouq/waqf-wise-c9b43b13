/**
 * useAccountDistribution Hook
 * Hook لجلب بيانات توزيع الحسابات
 * يستخدم AccountingService + RealtimeService
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AccountingService, RealtimeService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

interface AccountDistribution {
  name: string;
  value: number;
  count: number;
}

export function useAccountDistribution() {
  const queryClient = useQueryClient();

  const query = useQuery<AccountDistribution[]>({
    queryKey: QUERY_KEYS.ACCOUNTS,
    queryFn: () => AccountingService.getAccountDistribution(),
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    const subscription = RealtimeService.subscribeToTable(
      'accounts',
      () => { queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACCOUNTS }); }
    );

    return () => { subscription.unsubscribe(); };
  }, [queryClient]);

  return query;
}
