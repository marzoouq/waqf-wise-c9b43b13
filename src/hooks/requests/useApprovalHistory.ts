/**
 * useApprovalHistory Hook
 * @version 2.8.68
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApprovalService } from '@/services';

export interface ApprovalHistoryData {
  approval_type: 'loan' | 'payment' | 'distribution' | 'journal';
  approval_id: string;
  reference_id: string;
  action: 'approved' | 'rejected';
  performed_by: string;
  performed_by_name: string;
  notes?: string;
}

export function useApprovalHistory() {
  const queryClient = useQueryClient();

  const addToHistory = useMutation({
    mutationFn: (data: ApprovalHistoryData) => ApprovalService.addToHistory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval_history'] });
    },
  });

  return { addToHistory };
}
