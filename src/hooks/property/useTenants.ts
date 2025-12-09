/**
 * useTenants Hook - يستخدم Service Layer
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { TenantService } from '@/services';
import type { Tenant, TenantInsert, TenantWithBalance } from '@/types/tenants';
import { QUERY_KEYS } from "@/lib/query-keys";

export function useTenants() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.TENANTS,
    queryFn: (): Promise<TenantWithBalance[]> => TenantService.getTenantsWithBalance(),
  });

  const addTenant = useMutation({
    mutationFn: (tenant: TenantInsert) => TenantService.create(tenant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TENANTS });
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

  const updateTenant = useMutation({
    mutationFn: ({ id, ...data }: Partial<Tenant> & { id: string }) => 
      TenantService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TENANTS });
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

  const deleteTenant = useMutation({
    mutationFn: (id: string) => TenantService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TENANTS });
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
    queryKey: QUERY_KEYS.TENANT(tenantId || ''),
    queryFn: () => tenantId ? TenantService.getById(tenantId) : null,
    enabled: !!tenantId,
  });
}
