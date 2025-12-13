/**
 * Emergency Aid Approvals Hook - استخدام LoansService
 * @refactored 2.9.2 - نقل منطق Supabase إلى LoansService
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { invalidateLoanQueries } from '@/lib/query-invalidation';
import { QUERY_KEYS } from '@/lib/query-keys';
import { LoansService } from '@/services/loans.service';

export interface EmergencyRequest {
  id: string;
  request_number: string;
  amount_requested: number;
  reason: string;
  urgency_level: string;
  status: string;
  sla_due_at: string;
  created_at: string;
  beneficiary_id: string;
  beneficiaries?: {
    full_name: string;
    national_id: string;
  };
}

export function useEmergencyAidApprovals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب الطلبات المعلقة
  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.EMERGENCY_APPROVALS,
    queryFn: async () => {
      const data = await LoansService.getPendingEmergencyRequests();
      return data as EmergencyRequest[];
    },
  });

  // موافقة على الطلب
  const approveMutation = useMutation({
    mutationFn: async ({ 
      id, 
      amount, 
      notes 
    }: { 
      id: string; 
      amount: number; 
      notes?: string;
    }) => {
      await LoansService.approveEmergencyRequest(id, amount, notes);
    },
    onSuccess: () => {
      toast({
        title: '✅ تمت الموافقة',
        description: 'تم الموافقة على الطلب بنجاح',
      });
      invalidateLoanQueries(queryClient);
    },
    onError: (error: Error) => {
      toast({
        title: '❌ خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // رفض الطلب
  const rejectMutation = useMutation({
    mutationFn: async ({ 
      id, 
      reason 
    }: { 
      id: string; 
      reason: string;
    }) => {
      await LoansService.rejectEmergencyRequest(id, reason);
    },
    onSuccess: () => {
      toast({
        title: '✅ تم الرفض',
        description: 'تم رفض الطلب',
      });
      invalidateLoanQueries(queryClient);
    },
    onError: (error: Error) => {
      toast({
        title: '❌ خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    requests,
    isLoading,
    error,
    approveRequest: approveMutation.mutateAsync,
    rejectRequest: rejectMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}
