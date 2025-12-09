/**
 * Hook لتتبع حالة التحويلات
 * @version 2.8.55
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_KEYS } from '@/lib/query-keys';

export interface TransferStatus {
  id: string;
  beneficiary_name: string;
  iban: string;
  amount: number;
  status: string;
  reference_number?: string | null;
  error_message?: string | null;
  processed_at?: string | null;
}

export function useTransferStatusTracker(transferFileId: string) {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: transfers = [], isLoading: loading, refetch } = useQuery({
    queryKey: QUERY_KEYS.TRANSFER_STATUS(transferFileId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_transfer_details')
        .select('id, beneficiary_name, iban, amount, status, reference_number, error_message, processed_at')
        .eq('transfer_file_id', transferFileId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!transferFileId,
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const stats = {
    total: transfers.length,
    completed: transfers.filter(t => t.status === 'completed').length,
    processing: transfers.filter(t => t.status === 'processing').length,
    failed: transfers.filter(t => t.status === 'failed').length,
    pending: transfers.filter(t => t.status === 'pending').length,
    totalAmount: transfers.reduce((sum, t) => sum + t.amount, 0),
    completedAmount: transfers.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
  };

  const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  return { transfers, loading, autoRefresh, setAutoRefresh, stats, progress, refetch };
}
