/**
 * Hook for approval workflow management
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ApprovalStep {
  level: number;
  approver_role: string;
  approver_name: string | null;
  action: string | null;
  actioned_at: string | null;
  notes: string | null;
}

export interface ApprovalStatus {
  id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  current_level: number;
  total_levels: number;
  started_at: string;
  completed_at: string | null;
  approval_steps: ApprovalStep[];
}

export function useApprovalWorkflow() {
  const { data: pendingApprovals, isLoading } = useQuery({
    queryKey: ["pending-approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approval_status")
        .select(`
          *,
          approval_steps (*)
        `)
        .eq("status", "pending")
        .order("started_at", { ascending: false });
      
      if (error) throw error;
      return data as ApprovalStatus[];
    },
  });

  return {
    pendingApprovals,
    isLoading,
  };
}
