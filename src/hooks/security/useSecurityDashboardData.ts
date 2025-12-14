/**
 * Hook for SecurityDashboard data fetching
 * يجلب بيانات الأحداث الأمنية ومحاولات الدخول
 */

import { useQuery } from "@tanstack/react-query";
import { SecurityService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface SecurityStats {
  total: number;
  warning: number;
  error: number;
  resolved: number;
}

export function useSecurityDashboardData() {
  const {
    data: securityEvents = [],
    isLoading: eventsLoading,
  } = useQuery({
    queryKey: QUERY_KEYS.SECURITY_EVENTS,
    queryFn: () => SecurityService.getSecurityEvents(50),
  });

  const {
    data: loginAttempts = [],
    isLoading: attemptsLoading,
  } = useQuery({
    queryKey: QUERY_KEYS.LOGIN_ATTEMPTS,
    queryFn: () => SecurityService.getLoginAttempts(20),
  });

  const stats: SecurityStats = {
    total: securityEvents.length,
    warning: securityEvents.filter(e => e.severity === 'warning').length,
    error: securityEvents.filter(e => e.severity === 'error').length,
    resolved: securityEvents.filter(e => e.resolved).length,
  };

  return {
    securityEvents: securityEvents as unknown as import("@/types/security").SecurityEvent[],
    loginAttempts: loginAttempts as unknown as import("@/types/security").LoginAttempt[],
    stats,
    isLoading: eventsLoading || attemptsLoading,
  };
}
