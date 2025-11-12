import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

export type AppRole = "nazer" | "admin" | "accountant" | "cashier" | "archivist" | "beneficiary" | "user";

export function useUserRole() {
  const { user } = useAuth();

  const { data: roles = [], isLoading, refetch } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get current authenticated user's ID
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authUser.id);

      if (error) {
        console.error("Error fetching user roles:", error);
        return [];
      }
      
      console.log("User roles loaded:", data);
      return (data || []).map(r => r.role as AppRole);
    },
    enabled: !!user,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('user-roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  const hasRole = (role: AppRole) => roles.includes(role);
  const primaryRole = roles[0] || "user";

  return {
    roles,
    primaryRole,
    isLoading,
    hasRole,
    isNazer: hasRole("nazer"),
    isAdmin: hasRole("admin"),
    isAccountant: hasRole("accountant"),
    isCashier: hasRole("cashier"),
    isArchivist: hasRole("archivist"),
    isBeneficiary: hasRole("beneficiary"),
    isUser: hasRole("user"),
  };
}
