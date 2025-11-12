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
      if (!user) {
        console.log("❌ No user in useUserRole");
        return [];
      }

      // Get current authenticated user's ID
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        console.log("❌ No authUser from getUser()");
        return [];
      }

      console.log("🔍 Fetching roles for user:", authUser.id, authUser.email);

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authUser.id);

      if (error) {
        console.error("❌ Error fetching user roles:", error);
        return [];
      }
      
      const rolesList = (data || []).map(r => r.role as AppRole);
      console.log("✅ User roles loaded:", rolesList);
      return rolesList;
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

  const isNazer = hasRole("nazer");
  const isAdmin = hasRole("admin");
  const isAccountant = hasRole("accountant");
  const isCashier = hasRole("cashier");
  const isArchivist = hasRole("archivist");
  const isBeneficiary = hasRole("beneficiary");
  const isUser = hasRole("user");

  console.log("🎭 Role flags:", { 
    roles, 
    isAdmin, 
    isNazer, 
    isAccountant, 
    isCashier, 
    isArchivist, 
    isBeneficiary,
    isUser
  });

  return {
    roles,
    primaryRole,
    isLoading,
    hasRole,
    isNazer,
    isAdmin,
    isAccountant,
    isCashier,
    isArchivist,
    isBeneficiary,
    isUser,
  };
}
