/**
 * Hook for fetching real security statistics
 * يجلب إحصائيات الأمان الحقيقية من قاعدة البيانات
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SecurityStats {
  failedLogins: number;
  sensitiveOperations: number;
  twoFaUsers: number;
  totalUsers: number;
}

export function useSecurityStats() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["security-stats"],
    queryFn: async (): Promise<SecurityStats> => {
      // Get date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

      // 1. Count failed login attempts (from audit_logs)
      const { count: failedLoginsCount } = await supabase
        .from("audit_logs")
        .select("*", { count: "exact", head: true })
        .eq("action_type", "login_failed")
        .gte("created_at", thirtyDaysAgoISO);

      // 2. Count sensitive operations (from audit_logs - excluding login/logout)
      const { count: sensitiveOpsCount } = await supabase
        .from("audit_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgoISO)
        .not("action_type", "in", '("login","logout","login_failed")');

      // 3. Count users with 2FA enabled
      const { count: twoFaCount } = await supabase
        .from("two_factor_secrets")
        .select("*", { count: "exact", head: true })
        .eq("enabled", true);

      // 4. Count total users from profiles table
      const { count: totalUsersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      return {
        failedLogins: failedLoginsCount || 0,
        sensitiveOperations: sensitiveOpsCount || 0,
        twoFaUsers: twoFaCount || 0,
        totalUsers: totalUsersCount || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    failedLogins: stats?.failedLogins ?? 0,
    sensitiveOperations: stats?.sensitiveOperations ?? 0,
    twoFaUsers: stats?.twoFaUsers ?? 0,
    totalUsers: stats?.totalUsers ?? 0,
    isLoading,
    error,
  };
}
