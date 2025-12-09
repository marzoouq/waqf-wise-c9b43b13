/**
 * Hook لإدارة موافقات طلبات الفزعة
 * Emergency Aid Approvals Hook
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { invalidateLoanQueries } from '@/lib/query-invalidation';
import { QUERY_KEYS } from '@/lib/query-keys';

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
      const { data, error } = await supabase
        .from('emergency_aid_requests')
        .select(`
          *,
          beneficiaries!inner(
            full_name,
            national_id
          )
        `)
        .eq('status', 'معلق')
        .order('sla_due_at', { ascending: true });

      if (error) throw error;
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
      const { error } = await supabase
        .from('emergency_aid_requests')
        .update({
          status: 'معتمد',
          amount_approved: amount,
          approved_at: new Date().toISOString(),
          notes,
        })
        .eq('id', id);

      if (error) throw error;
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
      const { error } = await supabase
        .from('emergency_aid_requests')
        .update({
          status: 'مرفوض',
          rejected_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', id);

      if (error) throw error;
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
