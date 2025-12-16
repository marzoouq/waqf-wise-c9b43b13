/**
 * usePaymentApprovals Hook
 * Hook لموافقات المدفوعات
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApprovalService } from "@/services/approval.service";
import { PaymentForApproval } from "@/types";
import { useToast } from "@/hooks/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useApprovalHistory } from "@/hooks/requests/useApprovalHistory";
import { invalidateQueryGroups } from "@/lib/query-invalidation";
import { QUERY_KEYS } from "@/lib/query-keys";

export function usePaymentApprovals() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToHistory } = useApprovalHistory();

  const query = useQuery<PaymentForApproval[]>({
    queryKey: QUERY_KEYS.PAYMENTS_WITH_APPROVALS,
    queryFn: () => ApprovalService.getPaymentApprovalsWithDetails(),
  });

  const approveMutation = useMutation({
    mutationFn: async ({ paymentId, approvalId, action, notes }: {
      paymentId: string;
      approvalId: string;
      action: "approve" | "reject";
      notes: string;
    }) => {
      await ApprovalService.processPaymentApproval(
        approvalId,
        action === "approve" ? "موافق" : "مرفوض",
        notes,
        user?.id
      );

      await addToHistory.mutateAsync({
        approval_type: "payment",
        approval_id: approvalId,
        reference_id: paymentId,
        action: action === "approve" ? "approved" : "rejected",
        performed_by: user?.id || "",
        performed_by_name: user?.user_metadata?.full_name || "مستخدم",
        notes
      });
    },
    onSuccess: (_, variables) => {
      // ✅ استدعاء واحد بدلاً من 2
      invalidateQueryGroups(queryClient, ['payments', 'approvals']);
      
      toast({
        title: "تمت العملية بنجاح",
        description: variables.action === "approve" ? "تمت الموافقة على المدفوعة" : "تم رفض المدفوعة"
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في العملية",
        description: error instanceof Error ? error.message : "حدث خطأ",
        variant: "destructive"
      });
    }
  });

  return {
    ...query,
    approveMutation,
  };
}
