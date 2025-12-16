/**
 * useDistributionApprovals Hook - موافقات التوزيعات
 * يستخدم FundService + RealtimeService
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/ui/use-toast";
import { useEffect } from "react";
import { createMutationErrorHandler } from "@/lib/errors";
import { FundService, RealtimeService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface DistributionApproval {
  id: string;
  distribution_id: string;
  level: number;
  approver_id?: string;
  approver_name: string;
  status: string;
  notes?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export function useDistributionApprovals(distributionId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = RealtimeService.subscribeToTable(
      'distribution_approvals',
      () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISTRIBUTIONS_WITH_APPROVALS });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISTRIBUTIONS });
      }
    );
    return () => { subscription.unsubscribe(); };
  }, [queryClient]);

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: [...QUERY_KEYS.DISTRIBUTIONS_WITH_APPROVALS, distributionId],
    queryFn: () => FundService.getDistributionApprovals(distributionId),
    enabled: !!distributionId,
  });

  const addApproval = useMutation({
    mutationFn: (approval: Omit<DistributionApproval, "id" | "created_at" | "updated_at">) => 
      FundService.addDistributionApproval(approval),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISTRIBUTIONS_WITH_APPROVALS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISTRIBUTIONS });
      toast({ title: "تمت الموافقة بنجاح", description: "تم تسجيل الموافقة على التوزيع" });
    },
    onError: createMutationErrorHandler({ context: 'approve_distribution', toastTitle: 'خطأ في الموافقة' }),
  });

  const updateApproval = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DistributionApproval> }) => 
      FundService.updateDistributionApproval(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISTRIBUTIONS_WITH_APPROVALS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISTRIBUTIONS });
      toast({ title: "تم التحديث بنجاح", description: "تم تحديث حالة الموافقة" });
    },
    onError: createMutationErrorHandler({ context: 'update_distribution_approval', toastTitle: 'خطأ في التحديث' }),
  });

  const checkAllApproved = () => approvals.length === 3 && approvals.every(a => a.status === "موافق");
  const hasRejection = () => approvals.some(a => a.status === "مرفوض");
  const getCurrentLevel = () => approvals.filter(a => a.status === "موافق").length + 1;

  return {
    approvals,
    isLoading,
    addApproval: addApproval.mutateAsync,
    updateApproval: updateApproval.mutateAsync,
    checkAllApproved,
    hasRejection,
    getCurrentLevel,
  };
}
