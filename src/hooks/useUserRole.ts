import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

export type AppRole = "nazer" | "admin" | "accountant" | "cashier" | "archivist" | "beneficiary" | "waqf_heir" | "user";

/**
 * Hook للحصول على أدوار المستخدم من AuthContext
 * يستخدم البيانات المخزنة مسبقاً في AuthContext لتجنب الجلب المزدوج
 */
export function useUserRole() {
  const { user, roles: authRoles, rolesLoading, hasRole: authHasRole } = useAuth();
  
  // تحويل الأدوار إلى AppRole type
  const roles = useMemo(() => authRoles as AppRole[], [authRoles]);
  
  const hasRole = (role: AppRole) => authHasRole(role);
  const primaryRole = (roles[0] || "user") as AppRole;

  const isNazer = hasRole("nazer");
  const isAdmin = hasRole("admin");
  const isAccountant = hasRole("accountant");
  const isCashier = hasRole("cashier");
  const isArchivist = hasRole("archivist");
  const isBeneficiary = hasRole("beneficiary");
  const isWaqfHeir = hasRole("waqf_heir");
  const isUser = hasRole("user");

  return {
    roles,
    primaryRole,
    isLoading: rolesLoading,
    hasRole,
    isNazer,
    isAdmin,
    isAccountant,
    isCashier,
    isArchivist,
    isBeneficiary,
    isWaqfHeir,
    isUser,
  };
}
