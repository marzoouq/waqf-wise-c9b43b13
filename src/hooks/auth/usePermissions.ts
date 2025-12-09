/**
 * usePermissions Hook - صلاحيات المستخدم
 * يستخدم UserService + RealtimeService
 */
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { UserService, RealtimeService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

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
    queryKey: QUERY_KEYS.USER_PERMISSIONS(user?.id),
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

      interface UserPermission {
        permission_key?: string;
        granted?: boolean;
      }
      (userPermissions as UserPermission[] | null)?.forEach((up) => {
        if (up.permission_key) {
          if (up.granted) {
            permissionsMap.set(up.permission_key, {
              id: up.permission_key,
              name: up.permission_key,
              category: 'user_specific',
              description: null,
            });
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

    const subscription = RealtimeService.subscribeToChanges(
      ['user_permissions', 'role_permissions'],
      () => refetch()
    );

    return () => { subscription.unsubscribe(); };
  }, [user?.id, refetch]);

  const permissionNames = permissions.map(p => p.name);
  const hasPermission = (permission: string): boolean => permissionNames.includes(permission);
  const hasAnyPermission = (perms: string[]): boolean => perms.some(p => permissionNames.includes(p));
  const hasAllPermissions = (perms: string[]): boolean => perms.every(p => permissionNames.includes(p));
  const getPermissionsByCategory = (category: string): Permission[] => permissions.filter(p => p.category === category);

  return { permissions, permissionNames, hasPermission, hasAnyPermission, hasAllPermissions, getPermissionsByCategory, isLoading: isLoading || (!!user && isFetching) };
}
