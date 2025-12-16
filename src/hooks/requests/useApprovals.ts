/**
 * Hook للموافقات البسيطة
 * @version 2.8.55
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/ui/use-toast';
import { ApprovalService } from '@/services';
import { QUERY_KEYS } from '@/lib/query-keys';

export interface ApprovalData {
  journal_entry_id: string;
  approver_name: string;
  status: 'approved' | 'rejected';
  notes?: string;
}

export function useApprovals() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // جلب الموافقات
  const { data: approvals, isLoading } = useQuery({
    queryKey: QUERY_KEYS.APPROVALS,
    queryFn: () => ApprovalService.getSimpleApprovals(),
  });

  // إضافة موافقة
  const addApproval = useMutation({
    mutationFn: (approvalData: ApprovalData) => ApprovalService.addSimpleApproval(approvalData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPROVALS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL_ENTRIES });
      
      toast({
        title: variables.status === 'approved' ? 'تمت الموافقة' : 'تم الرفض',
        description: variables.status === 'approved' 
          ? 'تمت الموافقة على القيد المحاسبي بنجاح'
          : 'تم رفض القيد المحاسبي',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء معالجة الطلب',
        variant: 'destructive',
      });
    },
  });

  return { 
    approvals, 
    isLoading, 
    addApproval 
  };
}
