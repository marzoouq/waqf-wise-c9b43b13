/**
 * useTenantsRealtime - اشتراكات Realtime لصفحة المستأجرين
 * @version 1.0.0
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_KEYS } from '@/lib/query-keys';

export function useTenantsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('tenants-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tenants' },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TENANTS });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tenant_ledger' },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TENANTS });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TENANT_LEDGER });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TENANTS_AGING });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contracts' },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TENANTS });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRACTS });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
