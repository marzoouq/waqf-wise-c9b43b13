import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TenantLedgerEntry, TenantLedgerInsert, TenantAgingItem } from '@/types/tenants';

export function useTenantLedger(tenantId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch ledger entries for a tenant
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['tenant-ledger', tenantId],
    queryFn: async (): Promise<TenantLedgerEntry[]> => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('tenant_ledger')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TenantLedgerEntry[];
    },
    enabled: !!tenantId,
  });

  // Add ledger entry
  const addEntry = useMutation({
    mutationFn: async (entry: TenantLedgerInsert) => {
      const { data, error } = await supabase
        .from('tenant_ledger')
        .insert(entry)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-ledger', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في إضافة القيد',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Calculate current balance
  const balance = entries.reduce(
    (acc, entry) => acc + (entry.debit_amount || 0) - (entry.credit_amount || 0),
    0
  );

  return {
    entries,
    isLoading,
    balance,
    addEntry: addEntry.mutateAsync,
    isAdding: addEntry.isPending,
  };
}

export function useTenantsAging() {
  return useQuery({
    queryKey: ['tenants-aging'],
    queryFn: async (): Promise<TenantAgingItem[]> => {
      const { data: tenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('id, full_name')
        .eq('status', 'active');

      if (tenantsError) throw tenantsError;

      const today = new Date();
      const agingData: TenantAgingItem[] = [];

      for (const tenant of tenants || []) {
        const { data: ledger } = await supabase
          .from('tenant_ledger')
          .select('*')
          .eq('tenant_id', tenant.id)
          .eq('transaction_type', 'invoice');

        let current = 0;
        let days_30 = 0;
        let days_60 = 0;
        let days_90 = 0;
        let over_90 = 0;

        for (const entry of ledger || []) {
          const transactionDate = new Date(entry.transaction_date);
          const daysDiff = Math.floor(
            (today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          const amount = (entry.debit_amount || 0) - (entry.credit_amount || 0);

          if (amount <= 0) continue;

          if (daysDiff <= 30) current += amount;
          else if (daysDiff <= 60) days_30 += amount;
          else if (daysDiff <= 90) days_60 += amount;
          else if (daysDiff <= 120) days_90 += amount;
          else over_90 += amount;
        }

        const total = current + days_30 + days_60 + days_90 + over_90;
        if (total > 0) {
          agingData.push({
            tenant_id: tenant.id,
            tenant_name: tenant.full_name,
            current,
            days_30,
            days_60,
            days_90,
            over_90,
            total,
          });
        }
      }

      return agingData.sort((a, b) => b.total - a.total);
    },
  });
}

export function useRecordInvoiceToLedger() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      tenantId,
      invoiceId,
      invoiceNumber,
      amount,
      description,
      propertyId,
      contractId,
    }: {
      tenantId: string;
      invoiceId: string;
      invoiceNumber: string;
      amount: number;
      description?: string;
      propertyId?: string;
      contractId?: string;
    }) => {
      const { error } = await supabase.from('tenant_ledger').insert({
        tenant_id: tenantId,
        transaction_type: 'invoice',
        reference_type: 'invoice',
        reference_id: invoiceId,
        reference_number: invoiceNumber,
        description: description || `فاتورة رقم ${invoiceNumber}`,
        debit_amount: amount,
        credit_amount: 0,
        property_id: propertyId,
        contract_id: contractId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في تسجيل الفاتورة',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRecordPaymentToLedger() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      tenantId,
      paymentId,
      receiptNumber,
      amount,
      description,
      propertyId,
      contractId,
    }: {
      tenantId: string;
      paymentId: string;
      receiptNumber: string;
      amount: number;
      description?: string;
      propertyId?: string;
      contractId?: string;
    }) => {
      const { error } = await supabase.from('tenant_ledger').insert({
        tenant_id: tenantId,
        transaction_type: 'payment',
        reference_type: 'receipt_voucher',
        reference_id: paymentId,
        reference_number: receiptNumber,
        description: description || `سند قبض رقم ${receiptNumber}`,
        debit_amount: 0,
        credit_amount: amount,
        property_id: propertyId,
        contract_id: contractId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في تسجيل الدفعة',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
