/**
 * User Permissions Override Hook
 * @version 2.8.43
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SecurityService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

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
    queryKey: QUERY_KEYS.USER_PERMISSIONS_OVERRIDES(userId),
    queryFn: () => SecurityService.getUserPermissionOverrides(userId),
    enabled: !!userId,
  });

  const addOverrideMutation = useMutation({
    mutationFn: ({ permissionKey, granted }: { permissionKey: string; granted: boolean }) => 
      SecurityService.upsertUserPermissionOverride(userId, permissionKey, granted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PERMISSIONS_OVERRIDES(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PERMISSIONS(userId) });
    },
  });

  const removeOverrideMutation = useMutation({
    mutationFn: (permissionKey: string) => 
      SecurityService.removeUserPermissionOverride(userId, permissionKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PERMISSIONS_OVERRIDES(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PERMISSIONS(userId) });
    },
  });

  return {
    userOverrides: (overridesQuery.data || []) as UserPermissionOverride[],
    isLoading: overridesQuery.isLoading,
    addOverride: addOverrideMutation.mutateAsync,
    removeOverride: removeOverrideMutation.mutateAsync,
    isAdding: addOverrideMutation.isPending,
    isRemoving: removeOverrideMutation.isPending,
  };
}
