import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type UserRole = 'admin' | 'user' | 'accountant' | 'beneficiary';

export function useUserRole() {
  const { user } = useAuth();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) throw error;
      return (data || []).map(r => r.role as UserRole);
    },
    enabled: !!user?.id,
  });

  const hasRole = (role: UserRole) => roles.includes(role);
  const isAdmin = hasRole('admin');
  const isAccountant = hasRole('accountant');
  const isBeneficiary = hasRole('beneficiary');

  return {
    roles,
    isLoading,
    hasRole,
    isAdmin,
    isAccountant,
    isBeneficiary,
  };
}
