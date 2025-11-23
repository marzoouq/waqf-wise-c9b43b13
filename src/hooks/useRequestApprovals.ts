import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { createMutationErrorHandler } from "@/lib/errors";

export interface RequestApproval {
  id: string;
  request_id: string;
  level: number; // 1: مشرف, 2: مدير, 3: ناظر
  approver_id?: string;
  approver_name: string;
  status: string; // معلق، موافق، مرفوض
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
    const channel = supabase
      .channel('request-approvals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'request_approvals'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["request_approvals"] });
          queryClient.invalidateQueries({ queryKey: ["requests"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ["request_approvals", requestId || undefined],
    queryFn: async () => {
      let query = supabase
        .from("request_approvals")
        .select("*")
        .order("level", { ascending: true });

      if (requestId) {
        query = query.eq("request_id", requestId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as RequestApproval[];
    },
    enabled: !!requestId,
  });

  const addApproval = useMutation({
    mutationFn: async (approval: Omit<RequestApproval, "id" | "created_at" | "updated_at">) => {
      // التحقق من وجود موافقة سابقة بنفس المستوى
      const { data: existing, error: checkError } = await supabase
        .from("request_approvals")
        .select("id")
        .eq("request_id", approval.request_id)
        .eq("level", approval.level)
        .maybeSingle();

      if (checkError) {
        logger.error(checkError, { context: 'request_approval_check', severity: 'low' });
      }

      // إذا كانت موجودة، نقوم بالتحديث بدلاً من الإدراج
      if (existing && typeof existing === 'object' && 'id' in existing) {
        const { data, error } = await supabase
          .from("request_approvals")
          .update({
            status: approval.status,
            notes: approval.notes,
            approved_at: approval.approved_at,
            approver_id: approval.approver_id,
            approver_name: approval.approver_name,
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // إذا لم تكن موجودة، نقوم بالإدراج
      const { data, error } = await supabase
        .from("request_approvals")
        .insert([approval])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request_approvals"] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
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
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<RequestApproval> }) => {
      const { data, error } = await supabase
        .from("request_approvals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request_approvals"] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
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
    return approvals.length === 3 && approvals.every(a => a.status === "موافق");
  };

  const hasRejection = () => {
    return approvals.some(a => a.status === "مرفوض");
  };

  const getCurrentLevel = () => {
    const approvedCount = approvals.filter(a => a.status === "موافق").length;
    return approvedCount + 1; // المستوى التالي
  };

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
