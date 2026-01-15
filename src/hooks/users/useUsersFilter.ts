/**
 * useUsersFilter Hook
 * فلترة المستخدمين الموحدة - يُستخدم في Users و RolesManagement
 * @version 2.9.12
 * 
 * التحسينات:
 * - إضافة فلتر نوع المستخدم (staff/beneficiaries)
 */

import { useState, useMemo } from "react";
import type { UserProfile } from "@/types/auth";
import type { AppRole } from "@/types/roles";

// أدوار المشرفين والموظفين
export const STAFF_ROLES: readonly AppRole[] = [
  'nazer',
  'admin',
  'accountant',
  'cashier',
  'archivist',
  'user',
] as const;

// أدوار المستفيدين
export const BENEFICIARY_ROLES: readonly AppRole[] = [
  'beneficiary',
  'waqf_heir',
] as const;

export type UserTypeFilter = 'staff' | 'beneficiaries';

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
  userTypeFilter: UserTypeFilter;
  setUserTypeFilter: (type: UserTypeFilter) => void;
  resetFilters: () => void;
  staffCount: number;
  beneficiariesCount: number;
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
  const [userTypeFilter, setUserTypeFilter] = useState<UserTypeFilter>("staff");

  // حساب عدد كل نوع
  const { staffCount, beneficiariesCount } = useMemo(() => {
    let staff = 0;
    let beneficiaries = 0;

    users.forEach((user) => {
      const userRoles = user.roles_array || user.user_roles?.map(r => r.role) || [];
      const hasStaffRole = userRoles.some(role => STAFF_ROLES.includes(role as AppRole));
      const hasBeneficiaryRole = userRoles.some(role => BENEFICIARY_ROLES.includes(role as AppRole));

      if (hasStaffRole) staff++;
      if (hasBeneficiaryRole) beneficiaries++;
    });

    return { staffCount: staff, beneficiariesCount: beneficiaries };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const userRoles = user.roles_array || user.user_roles?.map(r => r.role) || [];

      // فلتر نوع المستخدم (مشرفين أو مستفيدين)
      const targetRoles = userTypeFilter === 'staff' ? STAFF_ROLES : BENEFICIARY_ROLES;
      const matchesUserType = userRoles.some(role => targetRoles.includes(role as AppRole));

      if (!matchesUserType) return false;

      // البحث في الاسم والبريد
      const matchesSearch =
        (user.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      // فلترة الأدوار - دعم كلا التنسيقين
      let matchesRole = roleFilter === "all";
      if (!matchesRole) {
        matchesRole = userRoles.includes(roleFilter);
      }

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter, userTypeFilter]);

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
    userTypeFilter,
    setUserTypeFilter,
    resetFilters,
    staffCount,
    beneficiariesCount,
  };
}
