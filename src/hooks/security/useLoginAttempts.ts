/**
 * Hook for fetching login attempts
 * جلب محاولات تسجيل الدخول
 */

import { useQuery } from "@tanstack/react-query";
import { SecurityService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { Database } from "@/integrations/supabase/types";

type LoginAttemptRow = Database['public']['Tables']['login_attempts_log']['Row'];

export interface LoginAttemptStats {
  total: number;
  successful: number;
  failed: number;
  failedPercentage: number;
}

export function useLoginAttempts(limit = 20) {
  const {
    data: loginAttempts = [],
    isLoading,
    error,
    refetch,
  } = useQuery<LoginAttemptRow[]>({
    queryKey: [...QUERY_KEYS.LOGIN_ATTEMPTS, limit],
    queryFn: () => SecurityService.getLoginAttempts(limit),
  });

  const stats: LoginAttemptStats = {
    total: loginAttempts.length,
    successful: loginAttempts.filter(a => a.success).length,
    failed: loginAttempts.filter(a => !a.success).length,
    failedPercentage: loginAttempts.length > 0 
      ? Math.round((loginAttempts.filter(a => !a.success).length / loginAttempts.length) * 100)
      : 0,
  };

  return {
    loginAttempts,
    stats,
    isLoading,
    error,
    refetch,
  };
}
