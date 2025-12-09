/**
 * useRequestApprovals Hook
 * Hook لموافقات الطلبات
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApprovalService } from "@/services/approval.service";
import { RequestService } from "@/services";
import { RequestWithBeneficiary } from "@/types/approvals";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useRequestApprovals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery<RequestWithBeneficiary[]>({
    queryKey: QUERY_KEYS.REQUESTS_WITH_APPROVALS,
    queryFn: () => ApprovalService.getRequestApprovals(),
  });

  const approveMutation = useMutation({
    mutationFn: async ({ requestId, notes }: { requestId: string; notes: string }) => {
      return RequestService.approve(requestId, 'current-user-id', 'الموظف', notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUESTS_WITH_APPROVALS });
      toast({
        title: "تمت الموافقة",
        description: "تمت الموافقة على الطلب بنجاح",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      return RequestService.reject(requestId, 'current-user-id', 'الموظف', reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUESTS_WITH_APPROVALS });
      toast({
        title: "تم الرفض",
        description: "تم رفض الطلب",
      });
    },
  });

  return {
    ...query,
    approveMutation,
    rejectMutation,
  };
}
