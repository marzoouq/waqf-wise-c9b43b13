import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export interface DistributionApproval {
  id: string;
  distribution_id: string;
  level: number; // 1: محاسب, 2: مدير مالي, 3: ناظر
  approver_id?: string;
  approver_name: string;
  status: string; // معلق، موافق، مرفوض
  notes?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export function useDistributionApprovals(distributionId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('distribution-approvals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'distribution_approvals'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["distribution_approvals"] });
          queryClient.invalidateQueries({ queryKey: ["distributions"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ["distribution_approvals", distributionId],
    queryFn: async () => {
      let query = supabase
        .from("distribution_approvals")
        .select("*")
        .order("level", { ascending: true });

      if (distributionId) {
        query = query.eq("distribution_id", distributionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as DistributionApproval[];
    },
    enabled: !!distributionId,
  });

  const addApproval = useMutation({
    mutationFn: async (approval: Omit<DistributionApproval, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("distribution_approvals")
        .insert([approval])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distribution_approvals"] });
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      toast({
        title: "تمت الموافقة بنجاح",
        description: "تم تسجيل الموافقة على التوزيع",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الموافقة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateApproval = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DistributionApproval> }) => {
      const { data, error } = await supabase
        .from("distribution_approvals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distribution_approvals"] });
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث حالة الموافقة",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    },
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
