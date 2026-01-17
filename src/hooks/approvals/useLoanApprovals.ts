/**
 * Hook لإدارة موافقات القروض
 * @version 2.8.52
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoansService } from '@/services/loans.service';
import { AccountingService } from '@/services/accounting.service';
import { useToast } from '@/hooks/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useApprovalHistory } from '@/hooks/requests/useApprovalHistory';
import { invalidateAccountingQueries } from '@/lib/query-invalidation';
import type { LoanForApproval } from '@/types';
import { QUERY_KEYS } from '@/lib/query-keys';
import { matchesStatus } from '@/lib/constants';

export function useLoanApprovals() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToHistory } = useApprovalHistory();

  // جلب القروض مع الموافقات
  const { data: loans, isLoading, error, refetch } = useQuery<LoanForApproval[]>({
    queryKey: QUERY_KEYS.LOANS_WITH_APPROVALS,
    queryFn: async () => {
      const data = await LoansService.getLoansWithApprovals();
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
      
      await LoansService.updateLoanApproval(approvalId, {
        status,
        notes,
        approved_at: new Date().toISOString(),
        approver_id: user?.id
      });

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
        const loan = await LoansService.getLoanForJournalEntry(loanId);
        const allApprovals = await LoansService.getLoanApprovalsByLoanId(loanId);
        const allApproved = allApprovals?.every((a) => matchesStatus(a.status, 'موافق'));

        if (allApproved && loan) {
          await AccountingService.createAutoJournalEntry({
            trigger: 'loan_approved',
            referenceId: loanId,
            referenceType: 'loan',
            amount: loan.loan_amount,
            description: `صرف قرض ${loan.loan_number} - ${(loan.beneficiaries as { full_name: string }).full_name}`,
          });
        }
      }

      return { action };
    },
    onSuccess: (data) => {
      invalidateAccountingQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOANS_WITH_APPROVALS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOANS });
      
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
    refetch,
    approveLoan: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
  };
}
