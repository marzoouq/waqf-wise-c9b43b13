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
import { QUERY_KEYS } from "@/lib/query-keys";

export type { UnifiedKPIsData };

export function useUnifiedKPIs() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.UNIFIED_KPIS,
    queryFn: () => DashboardService.getUnifiedKPIs(),
    ...QUERY_CONFIG.DASHBOARD_KPIS
  });

  // الاشتراك في التحديثات المباشرة عبر قناة واحدة موحدة
  useEffect(() => {
    const tables = ['beneficiaries', 'properties', 'contracts', 'payments', 'journal_entries', 'journal_entry_lines', 'loans', 'beneficiary_requests', 'families', 'funds'];
    
    const channel = supabase.channel('unified-dashboard-kpis-realtime');
    
    tables.forEach(table => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.UNIFIED_KPIS });
      });
    });
    
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.UNIFIED_KPIS });
  }, [queryClient]);

  return {
    ...query,
    refresh,
    lastUpdated: query.data?.lastUpdated
  };
}
