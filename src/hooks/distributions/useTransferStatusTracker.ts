/**
 * Hook لتتبع حالة التحويلات
 * @version 2.8.68
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DistributionService } from '@/services';
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
    queryFn: () => DistributionService.getTransferDetails(transferFileId),
    enabled: !!transferFileId,
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const typedTransfers = transfers as TransferStatus[];
  const stats = {
    total: typedTransfers.length,
    completed: typedTransfers.filter(t => t.status === 'completed').length,
    processing: typedTransfers.filter(t => t.status === 'processing').length,
    failed: typedTransfers.filter(t => t.status === 'failed').length,
    pending: typedTransfers.filter(t => t.status === 'pending').length,
    totalAmount: typedTransfers.reduce((sum, t) => sum + t.amount, 0),
    completedAmount: typedTransfers.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
  };

  const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  return { transfers: typedTransfers, loading, autoRefresh, setAutoRefresh, stats, progress, refetch };
}
