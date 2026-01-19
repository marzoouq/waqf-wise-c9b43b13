/**
 * useRequestApprovals Hook
 * Hook لموافقات الطلبات
 * @version 2.9.3
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApprovalService } from "@/services/approval.service";
import { RequestService } from "@/services";
import { RequestWithBeneficiary } from "@/types/approvals";
import { useToast } from "@/hooks/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { QUERY_KEYS } from "@/lib/query-keys";
import { invalidateQueryGroups } from "@/lib/query-invalidation";

export function useRequestApprovals() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery<RequestWithBeneficiary[]>({
    queryKey: QUERY_KEYS.REQUESTS_WITH_APPROVALS,
    queryFn: () => ApprovalService.getRequestApprovals(),
  });

  const approveMutation = useMutation({
    mutationFn: async ({ requestId, notes }: { requestId: string; notes: string }) => {
      const userId = user?.id || '';
      const userName = user?.user_metadata?.full_name || 'مستخدم';
      return RequestService.approve(requestId, userId, userName, notes);
    },
    onSuccess: () => {
      invalidateQueryGroups(queryClient, ['approvals', 'beneficiaries']);
      toast({
        title: "تمت الموافقة",
        description: "تمت الموافقة على الطلب بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في الموافقة",
        description: error instanceof Error ? error.message : "حدث خطأ",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      const userId = user?.id || '';
      const userName = user?.user_metadata?.full_name || 'مستخدم';
      return RequestService.reject(requestId, userId, userName, reason);
    },
    onSuccess: () => {
      invalidateQueryGroups(queryClient, ['approvals', 'beneficiaries']);
      toast({
        title: "تم الرفض",
        description: "تم رفض الطلب",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في الرفض",
        description: error instanceof Error ? error.message : "حدث خطأ",
        variant: "destructive",
      });
    },
  });

  return {
    ...query,
    approveMutation,
    rejectMutation,
  };
}
