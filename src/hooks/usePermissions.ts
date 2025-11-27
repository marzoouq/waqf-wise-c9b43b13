import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

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
      if (!user) {
        return [];
      }

      // Get user's roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
        return [];
      }

      if (!userRoles || userRoles.length === 0) {
        return [];
      }

      const roles = userRoles.map(r => r.role);

      // Get role permissions
      const { data: rolePermissions, error: rolePermsError } = await supabase
        .from("role_permissions")
        .select(`
          permission_id,
          granted,
          permissions (
            id,
            name,
            category,
            description
          )
        `)
        .in("role", roles)
        .eq("granted", true);

      if (rolePermsError) {
        console.error("Error fetching role permissions:", rolePermsError);
        return [];
      }

      // Get user-specific permission overrides
      const { data: userPermissions, error: userPermsError } = await supabase
        .from("user_permissions")
        .select(`
          permission_key,
          granted
        `)
        .eq("user_id", user.id);

      if (userPermsError) {
        console.error("Error fetching user permissions:", userPermsError);
      }

      // Merge permissions (user overrides take precedence)
      const permissionsMap = new Map<string, Permission>();

      // Add role permissions
      (rolePermissions as RolePermissionResult[] | null)?.forEach((rp) => {
        if (rp.permissions && rp.granted) {
          permissionsMap.set(rp.permissions.name, rp.permissions);
        }
      });

      // Override with user-specific permissions
      userPermissions?.forEach((up) => {
        if (up.permission_key) {
          if (up.granted) {
            // Create a simple permission entry for user-specific permissions
            const perm: Permission = {
              id: up.permission_key,
              name: up.permission_key,
              category: 'user_specific',
              description: null,
            };
            permissionsMap.set(up.permission_key, perm);
          } else {
            // User explicitly denied this permission
            permissionsMap.delete(up.permission_key);
          }
        }
      });

      return Array.from(permissionsMap.values());
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  // Real-time subscription for permission changes
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('permissions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_permissions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'role_permissions'
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

  const permissionNames = permissions.map(p => p.name);

  const hasPermission = (permission: string): boolean => {
    return permissionNames.includes(permission);
  };

  const hasAnyPermission = (perms: string[]): boolean => {
    return perms.some(p => permissionNames.includes(p));
  };

  const hasAllPermissions = (perms: string[]): boolean => {
    return perms.every(p => permissionNames.includes(p));
  };

  const getPermissionsByCategory = (category: string): Permission[] => {
    return permissions.filter(p => p.category === category);
  };

  return {
    permissions,
    permissionNames,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissionsByCategory,
    isLoading: isLoading || (!!user && isFetching),
  };
}
