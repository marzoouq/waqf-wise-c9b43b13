import { useAuth } from "./useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ApprovalLevel = 1 | 2 | 3;

export interface ApprovalPermissions {
  canApproveLevel: (level: ApprovalLevel) => boolean;
  userRole: string | null;
  isLoading: boolean;
}

/**
 * Hook للتحقق من صلاحيات الموافقة حسب الدور
 * 
 * المستوى 1: المشرف (admin)
 * المستوى 2: المحاسب (accountant)
 * المستوى 3: الناظر (nazer)
 */
export function useApprovalPermissions(): ApprovalPermissions {
  const { user } = useAuth();

  const { data: userRole, isLoading } = useQuery({
    queryKey: ["user_role", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data?.role || null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });

  const canApproveLevel = (level: ApprovalLevel): boolean => {
    if (!userRole) return false;

    // الناظر يمكنه الموافقة على كل المستويات
    if (userRole === "nazer") {
      return true;
    }

    // Admin (المشرف) يمكنه الموافقة على المستوى 1
    if (level === 1 && userRole === "admin") {
      return true;
    }

    // المحاسب يمكنه الموافقة على المستوى 1 و 2
    if (level <= 2 && userRole === "accountant") {
      return true;
    }

    return false;
  };

  return {
    canApproveLevel,
    userRole,
    isLoading,
  };
}
