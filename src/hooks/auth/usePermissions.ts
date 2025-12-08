import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { UserService } from "@/services/user.service";
import { supabase } from "@/integrations/supabase/client";

export interface Permission {
  id: string;
  name: string;
  category: string;
  description: string | null;
}

interface RolePermissionResult {
  permission_id: string;
  granted: boolean;
  permissions: Permission | null;
}

export function usePermissions() {
  const { user } = useAuth();

  const { data: permissions = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["user-permissions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const result = await UserService.getUserPermissions(user.id);
      if (Array.isArray(result)) return [];
      
      const { rolePermissions, userPermissions } = result;

      const permissionsMap = new Map<string, Permission>();

      (rolePermissions as RolePermissionResult[] | null)?.forEach((rp) => {
        if (rp.permissions && rp.granted) {
          permissionsMap.set(rp.permissions.name, rp.permissions);
        }
      });

      userPermissions?.forEach((up: any) => {
        if (up.permission_key) {
          if (up.granted) {
            const perm: Permission = {
              id: up.permission_key,
              name: up.permission_key,
              category: 'user_specific',
              description: null,
            };
            permissionsMap.set(up.permission_key, perm);
          } else {
            permissionsMap.delete(up.permission_key);
          }
        }
      });

      return Array.from(permissionsMap.values());
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('permissions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_permissions', filter: `user_id=eq.${user.id}` }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'role_permissions' }, () => refetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, refetch]);

  const permissionNames = permissions.map(p => p.name);
  const hasPermission = (permission: string): boolean => permissionNames.includes(permission);
  const hasAnyPermission = (perms: string[]): boolean => perms.some(p => permissionNames.includes(p));
  const hasAllPermissions = (perms: string[]): boolean => perms.every(p => permissionNames.includes(p));
  const getPermissionsByCategory = (category: string): Permission[] => permissions.filter(p => p.category === category);

  return { permissions, permissionNames, hasPermission, hasAnyPermission, hasAllPermissions, getPermissionsByCategory, isLoading: isLoading || (!!user && isFetching) };
}
