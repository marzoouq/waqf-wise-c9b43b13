/**
 * User Permissions Override Hook
 * @version 2.8.40
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserPermissionOverride {
  id: string;
  user_id: string;
  permission_key: string;
  granted: boolean;
  granted_at: string;
}

export function useUserPermissionsOverride(userId: string) {
  const queryClient = useQueryClient();

  const overridesQuery = useQuery({
    queryKey: ["user-permissions-overrides", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_permissions")
        .select("*")
        .eq("user_id", userId);
      
      if (error) throw error;
      return data as UserPermissionOverride[];
    },
    enabled: !!userId,
  });

  const addOverrideMutation = useMutation({
    mutationFn: async ({ permissionKey, granted }: { permissionKey: string; granted: boolean }) => {
      const { error } = await supabase
        .from("user_permissions")
        .upsert({
          user_id: userId,
          permission_key: permissionKey,
          granted,
          granted_at: new Date().toISOString()
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-permissions-overrides"] });
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
    },
  });

  const removeOverrideMutation = useMutation({
    mutationFn: async (permissionKey: string) => {
      const { error } = await supabase
        .from("user_permissions")
        .delete()
        .eq("user_id", userId)
        .eq("permission_key", permissionKey);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-permissions-overrides"] });
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
    },
  });

  return {
    userOverrides: overridesQuery.data || [],
    isLoading: overridesQuery.isLoading,
    addOverride: addOverrideMutation.mutateAsync,
    removeOverride: removeOverrideMutation.mutateAsync,
    isAdding: addOverrideMutation.isPending,
    isRemoving: removeOverrideMutation.isPending,
  };
}
