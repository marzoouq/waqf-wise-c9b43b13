/**
 * useAccountantKPIs Hook
 * Hook موحد لجلب إحصائيات المحاسب - يستخدم Service Layer
 */

import { useQuery } from "@tanstack/react-query";
import { AccountingService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface AccountantKPIs {
  pendingApprovals: number;
  draftEntries: number;
  postedEntries: number;
  cancelledEntries: number;
  todayEntries: number;
  monthlyTotal: number;
  totalEntries: number;
}

export function useAccountantKPIs() {
  return useQuery({
    queryKey: QUERY_KEYS.ACCOUNTANT_KPIS,
    queryFn: (): Promise<AccountantKPIs> => AccountingService.getAccountantKPIs(),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
