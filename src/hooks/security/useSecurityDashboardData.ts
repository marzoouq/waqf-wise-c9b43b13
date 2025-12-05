/**
 * Hook for SecurityDashboard data fetching
 * يجلب بيانات الأحداث الأمنية ومحاولات الدخول
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SecurityEvent, LoginAttempt } from "@/types/security";

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
    queryKey: ["security-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_events_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as SecurityEvent[];
    },
  });

  const {
    data: loginAttempts = [],
    isLoading: attemptsLoading,
  } = useQuery({
    queryKey: ["login-attempts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("login_attempts_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as LoginAttempt[];
    },
  });

  const stats: SecurityStats = {
    total: securityEvents.length,
    warning: securityEvents.filter(e => e.severity === 'warning').length,
    error: securityEvents.filter(e => e.severity === 'error').length,
    resolved: securityEvents.filter(e => e.resolved).length,
  };

  return {
    securityEvents,
    loginAttempts,
    stats,
    isLoading: eventsLoading || attemptsLoading,
  };
}
