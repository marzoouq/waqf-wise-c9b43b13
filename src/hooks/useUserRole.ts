import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect, useRef, useMemo } from "react";

export type AppRole = "nazer" | "admin" | "accountant" | "cashier" | "archivist" | "beneficiary" | "user";

const IS_DEV = import.meta.env.DEV;

export function useUserRole() {
  const { user } = useAuth();
  const lastLoggedState = useRef<string>("");
  
  // Memoize user ID to prevent unnecessary re-renders
  const userId = useMemo(() => user?.id, [user?.id]);

  const { data: roles = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["user-roles", userId],
    queryFn: async () => {
      if (!userId) return [];

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);

        if (error) {
          if (IS_DEV) console.error('❌ useUserRole: Error fetching roles', error);
          return [];
        }
        
        return (data || []).map(r => r.role as AppRole);
      } catch (err) {
        if (IS_DEV) console.error('❌ useUserRole: Exception in queryFn', err);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('user-roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${userId}`
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refetch]);

  const hasRole = (role: AppRole) => roles.includes(role);
  const primaryRole = roles[0] || "user";

  // More accurate loading state
  const isLoadingRoles = isLoading || (!!userId && isFetching);

  const isNazer = hasRole("nazer");
  const isAdmin = hasRole("admin");
  const isAccountant = hasRole("accountant");
  const isCashier = hasRole("cashier");
  const isArchivist = hasRole("archivist");
  const isBeneficiary = hasRole("beneficiary");
  const isUser = hasRole("user");

  // Log state changes only in DEV and only when state actually changes
  useEffect(() => {
    if (!IS_DEV) return;
    
    const currentState = JSON.stringify({ roles, primaryRole, isLoading: isLoadingRoles, hasUser: !!userId });
    if (currentState !== lastLoggedState.current) {
      lastLoggedState.current = currentState;
      // Removed console.log for production cleanliness
    }
  }, [roles, primaryRole, isLoadingRoles, userId]);

  return {
    roles,
    primaryRole,
    isLoading: isLoadingRoles,
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
