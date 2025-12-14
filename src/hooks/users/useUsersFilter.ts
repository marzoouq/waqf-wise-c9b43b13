/**
 * useUsersFilter Hook
 * فلترة المستخدمين الموحدة - يُستخدم في Users و RolesManagement
 * @version 2.9.11
 */

import { useState, useMemo } from "react";
import type { UserProfile } from "@/types/auth";
import type { AppRole } from "@/types/roles";

interface UserWithRoles {
  id: string;
  user_id?: string;
  email: string;
  full_name: string | null;
  roles_array?: string[];
  user_roles?: Array<{ role: string }>;
}

interface UseUsersFilterOptions<T extends UserWithRoles> {
  users: T[];
}

interface UseUsersFilterReturn<T extends UserWithRoles> {
  filteredUsers: T[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  resetFilters: () => void;
}

/**
 * Hook موحد لفلترة المستخدمين
 * يدعم كلا النوعين: UserProfile و UserWithRoles
 */
export function useUsersFilter<T extends UserWithRoles>({
  users,
}: UseUsersFilterOptions<T>): UseUsersFilterReturn<T> {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // البحث في الاسم والبريد
      const matchesSearch =
        (user.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      // فلترة الأدوار - دعم كلا التنسيقين
      let matchesRole = roleFilter === "all";
      if (!matchesRole) {
        // دعم roles_array (useRolesManagement)
        if (user.roles_array) {
          matchesRole = user.roles_array.includes(roleFilter);
        }
        // دعم user_roles (useUsersManagement)
        else if (user.user_roles) {
          matchesRole = user.user_roles.some((r) => r.role === roleFilter);
        }
      }

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
  };

  return {
    filteredUsers,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    resetFilters,
  };
}
