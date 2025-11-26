import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SecurityAlert {
  id: string;
  type: 'failed_login' | 'permission_change' | 'suspicious_activity' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  user_email?: string;
  ip_address?: string;
  timestamp: string;
  status: 'new' | 'investigating' | 'resolved';
}

export function useSecurityAlerts() {
  return useQuery({
    queryKey: ["security-alerts"],
    queryFn: async (): Promise<SecurityAlert[]> => {
      // جلب محاولات الدخول الفاشلة من audit_logs
      const { data: auditData, error } = await supabase
        .from("audit_logs")
        .select("id, action_type, severity, description, table_name, user_email, ip_address, created_at")
        .in("severity", ["error", "warn"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      // تحويل البيانات لصيغة SecurityAlert
      const alerts: SecurityAlert[] = (auditData || []).map(log => ({
        id: log.id,
        type: log.action_type.includes('login') ? 'failed_login' : 
              log.action_type.includes('permission') ? 'permission_change' : 'suspicious_activity',
        severity: log.severity === 'error' ? 'high' : 'medium',
        message: log.description || `${log.action_type} في ${log.table_name || 'النظام'}`,
        user_email: log.user_email || undefined,
        ip_address: log.ip_address || undefined,
        timestamp: log.created_at || new Date().toISOString(),
        status: 'new',
      }));

      return alerts;
    },
    refetchInterval: false, // Disable auto-refetch
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
