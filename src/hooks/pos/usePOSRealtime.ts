import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePOSRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('pos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cashier_shifts' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['pos', 'current-shift'] });
          queryClient.invalidateQueries({ queryKey: ['pos', 'shifts'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pos_transactions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['pos', 'transactions'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rental_payments' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['pos', 'pending-rentals'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
