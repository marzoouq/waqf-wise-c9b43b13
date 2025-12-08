/**
 * Hook for AccountantDashboard data fetching
 * يجلب بيانات الموافقات المعلقة للمحاسب
 */

import { useQuery } from "@tanstack/react-query";
import { AccountingService } from "@/services/accounting.service";
import { JournalApproval } from "@/types/approvals";

export function useAccountantDashboardData() {
  const {
    data: pendingApprovals = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pending_approvals"],
    queryFn: async () => {
      const data = await AccountingService.getPendingApprovals();
      return data as JournalApproval[];
    },
  });

  return {
    pendingApprovals,
    isLoading,
    error,
  };
}
