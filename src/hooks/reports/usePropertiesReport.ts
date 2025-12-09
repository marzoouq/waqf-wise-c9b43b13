/**
 * Properties Report Hook
 * @version 2.8.40
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import { PropertyRow, ContractRow } from "@/types/supabase-helpers";

export interface PropertyWithContracts extends PropertyRow {
  contracts?: ContractRow[];
}

export function usePropertiesReport() {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>();

  const query = useQuery<PropertyWithContracts[]>({
    queryKey: ["properties-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          contracts (
            id,
            contract_number,
            tenant_name,
            monthly_rent,
            status
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PropertyWithContracts[];
    },
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
          queryClient.invalidateQueries({ queryKey: ["properties-report"] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contracts' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["properties-report"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["properties-report"] });
  };

  return {
    properties: query.data || [],
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    lastUpdated,
    handleRefresh,
  };
}
