/**
 * useTenantLedger Hook - يستخدم Service Layer
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/ui/use-toast';
import { TenantService } from '@/services';
import { QUERY_KEYS } from '@/lib/query-keys';
import type { TenantLedgerEntry, TenantLedgerInsert, TenantAgingItem } from '@/types/tenants';

export function useTenantLedger(tenantId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.TENANT_LEDGER(tenantId || ''),
    queryFn: async (): Promise<TenantLedgerEntry[]> => {
      if (!tenantId) return [];
      return TenantService.getLedger(tenantId) as Promise<TenantLedgerEntry[]>;
    },
    enabled: !!tenantId,
  });

  const addEntry = useMutation({
    mutationFn: (entry: TenantLedgerInsert) => TenantService.addLedgerEntry(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TENANT_LEDGER(tenantId || '') });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TENANTS });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في إضافة القيد',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const balance = entries.reduce(
    (acc, entry) => acc + (entry.debit_amount || 0) - (entry.credit_amount || 0),
    0
  );

  return {
    entries,
    isLoading,
    balance,
    error,
    refetch,
    addEntry: addEntry.mutateAsync,
    isAdding: addEntry.isPending,
  };
}

export function useTenantsAging() {
  return useQuery({
    queryKey: QUERY_KEYS.TENANTS_AGING,
    queryFn: (): Promise<TenantAgingItem[]> => TenantService.getTenantsAging(),
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
      return TenantService.addLedgerEntry({
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'tenant-ledger' });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TENANTS });
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
      return TenantService.addLedgerEntry({
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'tenant-ledger' });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TENANTS });
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
