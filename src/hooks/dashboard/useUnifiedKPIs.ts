/**
 * Hook موحد لمؤشرات الأداء الرئيسية
 * يستخدم DashboardService كطبقة خدمة
 * 
 * @version 2.6.36
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import { useEffect, useCallback } from "react";
import { DashboardService, type UnifiedKPIsData } from "@/services";

export type { UnifiedKPIsData };

export function useUnifiedKPIs() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['unified-dashboard-kpis'],
    queryFn: () => DashboardService.getUnifiedKPIs(),
    ...QUERY_CONFIG.DASHBOARD_KPIS
  });

  // الاشتراك في التحديثات المباشرة
  useEffect(() => {
    const tables = ['beneficiaries', 'properties', 'contracts', 'payments', 'journal_entries', 'loans', 'beneficiary_requests', 'families', 'funds'];
    
    const channels = tables.map(table => 
      supabase
        .channel(`unified-dashboard-kpis-${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
          queryClient.invalidateQueries({ queryKey: ['unified-dashboard-kpis'] });
        })
        .subscribe()
    );

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [queryClient]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['unified-dashboard-kpis'] });
  }, [queryClient]);

  return {
    ...query,
    refresh,
    lastUpdated: query.data?.lastUpdated
  };
}
