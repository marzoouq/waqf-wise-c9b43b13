/**
 * Hook for fetching roles overview
 * جلب ملخص الأدوار والصلاحيات
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RoleStats {
  role: string;
  count: number;
  label: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "مدير النظام",
  nazer: "ناظر",
  accountant: "محاسب",
  cashier: "صراف",
  archivist: "أمين الأرشيف",
  user: "مستخدم",
  beneficiary: "مستفيد",
  waqf_heir: "وريث الوقف",
};

export function useRolesOverview() {
  const {
    data: rolesData = [],
    isLoading,
    error,
  } = useQuery<RoleStats[]>({
    queryKey: ['roles-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role");
      
      if (error) throw error;
      
      // تجميع الأدوار وحساب عددها
      const roleCounts: Record<string, number> = {};
      data?.forEach(item => {
        const role = item.role;
        roleCounts[role] = (roleCounts[role] || 0) + 1;
      });
      
      return Object.entries(roleCounts).map(([role, count]) => ({
        role,
        count,
        label: ROLE_LABELS[role] || role,
      }));
    },
  });

  const totalUsers = rolesData.reduce((acc, r) => acc + r.count, 0);
  const adminCount = rolesData.find(r => r.role === 'admin')?.count || 0;

  return {
    rolesData,
    totalUsers,
    adminCount,
    isLoading,
    error,
  };
}
