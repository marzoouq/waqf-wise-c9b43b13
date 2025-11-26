import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect } from "react";
import { productionLogger } from '@/lib/logger/production-logger';

export type AppRole = "nazer" | "admin" | "accountant" | "cashier" | "archivist" | "beneficiary" | "user";

export function useUserRole() {
  const { user } = useAuth();

  const { data: roles = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('🔍 useUserRole: No user yet');
        return [];
      }

      console.log('🔍 useUserRole: Fetching roles for user', { 
        email: user.email,
        userId: user.id 
      });

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (error) {
          console.error('❌ useUserRole: Error fetching roles', error);
          return [];
        }
        
        console.log('✅ useUserRole: Roles loaded successfully', { 
          roles: data,
          count: data?.length 
        });
        
        return (data || []).map(r => r.role as AppRole);
      } catch (err) {
        console.error('❌ useUserRole: Exception in queryFn', err);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
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

  // More accurate loading state
  const isLoadingRoles = isLoading || (!!user && isFetching);

  const isNazer = hasRole("nazer");
  const isAdmin = hasRole("admin");
  const isAccountant = hasRole("accountant");
  const isCashier = hasRole("cashier");
  const isArchivist = hasRole("archivist");
  const isBeneficiary = hasRole("beneficiary");
  const isUser = hasRole("user");

  console.log('🎭 useUserRole State:', {
    isLoading: isLoadingRoles,
    roles,
    primaryRole,
    hasUser: !!user
  });

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
