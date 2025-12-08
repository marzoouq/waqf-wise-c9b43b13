/**
 * useAccountDistribution Hook
 * Hook لجلب بيانات توزيع الحسابات
 * يستخدم AccountingService + RealtimeService
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AccountingService, RealtimeService } from "@/services";

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
    const subscription = RealtimeService.subscribeToTable(
      'accounts',
      () => { queryClient.invalidateQueries({ queryKey: ["account-distribution"] }); }
    );

    return () => { subscription.unsubscribe(); };
  }, [queryClient]);

  return query;
}
