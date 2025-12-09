/**
 * useSelfHealingStats Hook
 * إحصائيات نظام الإصلاح الذاتي
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SelfHealingStats {
  retrySuccessRate: number;
  systemHealth: number;
  totalErrors: number;
  resolvedErrors: number;
  activeAlerts: number;
}

export function useSelfHealingStats() {
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['self-healing-stats'],
    queryFn: async (): Promise<SelfHealingStats> => {
      // إجمالي الأخطاء
      const { count: totalErrors } = await supabase
        .from('system_error_logs')
        .select('*', { count: 'exact', head: true });
      
      // الأخطاء المحلولة
      const { count: resolvedErrors } = await supabase
        .from('system_error_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved');
      
      // التنبيهات النشطة
      const { count: activeAlerts } = await supabase
        .from('system_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      
      // معدل النجاح
      const total = totalErrors || 0;
      const resolved = resolvedErrors || 0;
      const retrySuccessRate = total > 0 
        ? Math.round((resolved / total) * 100) 
        : 100;
      
      // صحة النظام (عكسي للتنبيهات النشطة)
      const alerts = activeAlerts || 0;
      const systemHealth = alerts < 100 ? 99 : 
                          alerts < 500 ? 95 : 
                          alerts < 1000 ? 85 : 70;
      
      return {
        retrySuccessRate,
        systemHealth,
        totalErrors: total,
        resolvedErrors: resolved,
        activeAlerts: alerts,
      };
    },
    staleTime: 60 * 1000,
    refetchInterval: false,
  });

  return {
    stats,
    isLoading,
    refetch,
  };
}
