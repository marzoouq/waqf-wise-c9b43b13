/**
 * Hook لإدارة موافقات القروض
 * Loan Approvals Hook
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useApprovalHistory } from '@/hooks/useApprovalHistory';
import type { LoanForApproval } from '@/types';

export function useLoanApprovals() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToHistory } = useApprovalHistory();

  // جلب القروض مع الموافقات
  const { data: loans, isLoading, error } = useQuery<LoanForApproval[]>({
    queryKey: ['loans_with_approvals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          beneficiaries(full_name, national_id),
          loan_approvals(*)
        `)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as LoanForApproval[];
    },
  });

  // mutation للموافقة أو الرفض
  const approveMutation = useMutation({
    mutationFn: async ({ 
      loanId, 
      approvalId, 
      action, 
      notes 
    }: {
      loanId: string;
      approvalId: string;
      action: 'approve' | 'reject';
      notes: string;
    }) => {
      const status = action === 'approve' ? 'موافق' : 'مرفوض';
      
      const { error } = await supabase
        .from('loan_approvals')
        .update({
          status,
          notes,
          approved_at: new Date().toISOString(),
          approver_id: user?.id
        })
        .eq('id', approvalId);

      if (error) throw error;

      // سجل في تاريخ الموافقات
      await addToHistory.mutateAsync({
        approval_type: 'loan',
        approval_id: approvalId,
        reference_id: loanId,
        action: action === 'approve' ? 'approved' : 'rejected',
        performed_by: user?.id || '',
        performed_by_name: user?.user_metadata?.full_name || 'مستخدم',
        notes
      });

      // إذا تمت الموافقة النهائية، إنشاء القيد المحاسبي
      if (action === 'approve') {
        const { data: loan } = await supabase
          .from('loans')
          .select('loan_number, loan_amount, beneficiaries(full_name)')
          .eq('id', loanId)
          .single();

        const { data: allApprovals } = await supabase
          .from('loan_approvals')
          .select('status')
          .eq('loan_id', loanId);

        const allApproved = allApprovals?.every((a) => a.status === 'موافق');

        if (allApproved && loan) {
          await supabase.rpc('create_auto_journal_entry', {
            p_trigger_event: 'loan_approved',
            p_reference_id: loanId,
            p_amount: loan.loan_amount,
            p_description: `صرف قرض ${loan.loan_number} - ${(loan.beneficiaries as { full_name: string }).full_name}`,
            p_transaction_date: new Date().toISOString().split('T')[0]
          });
        }
      }

      return { action };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['loans_with_approvals'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['journal_entries'] });
      
      toast({
        title: 'تمت العملية بنجاح',
        description: data.action === 'approve' ? 'تمت الموافقة على القرض' : 'تم رفض القرض'
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في العملية';
      toast({
        title: 'خطأ في العملية',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  return {
    loans: loans || [],
    isLoading,
    error,
    approveLoan: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
  };
}
