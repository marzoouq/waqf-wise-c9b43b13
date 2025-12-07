import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tenant, TenantInsert, TenantWithBalance } from '@/types/tenants';

export function useTenants() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all tenants with balance
  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: async (): Promise<TenantWithBalance[]> => {
      const { data: tenantsData, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate balances for each tenant
      const tenantsWithBalance = await Promise.all(
        (tenantsData || []).map(async (tenant) => {
          const { data: ledgerData } = await supabase
            .from('tenant_ledger')
            .select('debit_amount, credit_amount, transaction_type')
            .eq('tenant_id', tenant.id);

          const ledger = ledgerData || [];
          const totalDebit = ledger.reduce((sum, e) => sum + (e.debit_amount || 0), 0);
          const totalCredit = ledger.reduce((sum, e) => sum + (e.credit_amount || 0), 0);
          const totalInvoices = ledger.filter(e => e.transaction_type === 'invoice').length;
          const totalPayments = ledger.filter(e => e.transaction_type === 'payment').length;

          return {
            ...tenant,
            current_balance: totalDebit - totalCredit,
            total_invoices: totalInvoices,
            total_payments: totalPayments,
          } as TenantWithBalance;
        })
      );

      return tenantsWithBalance;
    },
  });

  // Add tenant
  const addTenant = useMutation({
    mutationFn: async (tenant: TenantInsert) => {
      const { data, error } = await supabase
        .from('tenants')
        .insert(tenant)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({ title: 'تم إضافة المستأجر بنجاح' });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في إضافة المستأجر',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update tenant
  const updateTenant = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Tenant> & { id: string }) => {
      const { error } = await supabase
        .from('tenants')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({ title: 'تم تحديث المستأجر بنجاح' });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في تحديث المستأجر',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete tenant
  const deleteTenant = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tenants').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({ title: 'تم حذف المستأجر بنجاح' });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في حذف المستأجر',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    tenants,
    isLoading,
    addTenant: addTenant.mutateAsync,
    updateTenant: updateTenant.mutateAsync,
    deleteTenant: deleteTenant.mutateAsync,
    isAdding: addTenant.isPending,
    isUpdating: updateTenant.isPending,
    isDeleting: deleteTenant.isPending,
  };
}

export function useTenant(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (error) throw error;
      return data as Tenant;
    },
    enabled: !!tenantId,
  });
}
