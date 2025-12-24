/**
 * usePendingApprovals Hook - الموافقات المعلقة
 * يستخدم ApprovalService
 */
import { useQuery } from "@tanstack/react-query";
import { ApprovalService } from "@/services";
import { QUERY_CONFIG } from "@/infrastructure/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface PendingApproval {
  id: string;
  type: 'distribution' | 'request' | 'journal' | 'payment';
  title: string;
  amount?: number;
  date: Date;
  priority: 'high' | 'medium' | 'low';
  description: string;
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: QUERY_KEYS.PENDING_APPROVALS,
    queryFn: () => ApprovalService.getPendingApprovals(),
    ...QUERY_CONFIG.APPROVALS,
  });
}
