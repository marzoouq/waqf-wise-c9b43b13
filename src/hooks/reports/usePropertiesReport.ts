/**
 * Properties Report Hook
 * @version 2.8.86
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_CONFIG } from "@/infrastructure/react-query";
import { ReportService, type PropertyWithContracts } from "@/services/report.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export type { PropertyWithContracts };

export function usePropertiesReport() {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>();

  const query = useQuery<PropertyWithContracts[]>({
    queryKey: QUERY_KEYS.PROPERTIES_REPORT,
    queryFn: () => ReportService.getPropertiesReport(),
    ...QUERY_CONFIG.REPORTS,
  });

  // Update last updated time
  useEffect(() => {
    if (query.dataUpdatedAt) {
      setLastUpdated(new Date(query.dataUpdatedAt));
    }
  }, [query.dataUpdatedAt]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('properties-report-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'properties' },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROPERTIES_REPORT });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contracts' },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROPERTIES_REPORT });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROPERTIES_REPORT });
  };

  return {
    properties: query.data || [],
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    lastUpdated,
    handleRefresh,
    error: query.error,
    refetch: query.refetch,
  };
}
