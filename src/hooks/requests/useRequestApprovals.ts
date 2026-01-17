/**
 * useRequestApprovals Hook - موافقات الطلبات
 * يستخدم ApprovalService
 * @version 2.8.44
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { createMutationErrorHandler } from "@/lib/errors";
import { ApprovalService } from "@/services";
import { RealtimeService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";
import { matchesStatus } from "@/lib/constants";

export interface RequestApproval {
  id: string;
  request_id: string;
  level: number;
  approver_id?: string;
  approver_name: string;
  status: string;
  notes?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export function useRequestApprovals(requestId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Real-time subscription
  useEffect(() => {
    const subscription = RealtimeService.subscribeToTable(
      'request_approvals',
      () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUEST_APPROVALS() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUESTS });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const { data: approvals = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.REQUEST_APPROVALS(requestId),
    queryFn: () => ApprovalService.getRequestApprovalsByRequestId(requestId!),
    enabled: !!requestId,
  });

  const addApproval = useMutation({
    mutationFn: (approval: Omit<RequestApproval, "id" | "created_at" | "updated_at">) =>
      ApprovalService.upsertRequestApproval(approval),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUEST_APPROVALS() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUESTS });
      toast({
        title: "تمت الموافقة بنجاح",
        description: "تم تسجيل الموافقة على الطلب",
      });
    },
    onError: createMutationErrorHandler({
      context: 'approve_request',
      toastTitle: 'خطأ في الموافقة',
    }),
  });

  const updateApproval = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<RequestApproval> }) =>
      ApprovalService.updateRequestApproval(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUEST_APPROVALS() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUESTS });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث حالة الموافقة",
      });
    },
    onError: createMutationErrorHandler({
      context: 'update_request_approval',
      toastTitle: 'خطأ في التحديث',
    }),
  });

  const checkAllApproved = () => {
    return approvals.length === 3 && approvals.every((a) => matchesStatus(a.status, 'موافق'));
  };

  const hasRejection = () => {
    return approvals.some((a) => matchesStatus(a.status, 'مرفوض'));
  };

  const getCurrentLevel = () => {
    const approvedCount = approvals.filter((a) => matchesStatus(a.status, 'موافق')).length;
    return approvedCount + 1;
  };

  return {
    approvals,
    isLoading,
    error,
    refetch,
    addApproval: addApproval.mutateAsync,
    updateApproval: updateApproval.mutateAsync,
    checkAllApproved,
    hasRejection,
    getCurrentLevel,
  };
}
