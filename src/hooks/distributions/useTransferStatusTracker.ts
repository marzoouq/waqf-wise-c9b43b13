/**
 * Hook لتتبع حالة التحويلات
 * Transfer Status Tracker Hook
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';

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
  const [transfers, setTransfers] = useState<TransferStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadTransfers();
    
    if (autoRefresh) {
      const interval = setInterval(loadTransfers, 10000); // كل 10 ثواني
      return () => clearInterval(interval);
    }
  }, [transferFileId, autoRefresh]);

  const loadTransfers = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_transfer_details')
        .select('id, beneficiary_name, iban, amount, status, reference_number, error_message, processed_at')
        .eq('transfer_file_id', transferFileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransfers(data || []);
    } catch (error) {
      productionLogger.error('Error loading transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: transfers.length,
    completed: transfers.filter(t => t.status === 'completed').length,
    processing: transfers.filter(t => t.status === 'processing').length,
    failed: transfers.filter(t => t.status === 'failed').length,
    pending: transfers.filter(t => t.status === 'pending').length,
    totalAmount: transfers.reduce((sum, t) => sum + t.amount, 0),
    completedAmount: transfers
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
  };

  const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  return {
    transfers,
    loading,
    autoRefresh,
    setAutoRefresh,
    stats,
    progress,
    refetch: loadTransfers,
  };
}
