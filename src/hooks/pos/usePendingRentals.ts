import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PendingRental {
  id: string;
  contract_id: string;
  contract_number: string;
  property_name: string;
  tenant_name: string;
  amount_due: number;
  tax_amount: number;
  net_amount: number;
  due_date: string;
  status: string;
  days_overdue: number;
  is_overdue: boolean;
}

interface RentalPaymentData {
  id: string;
  contract_id: string;
  amount_due: number | null;
  tax_amount: number | null;
  net_amount: number | null;
  due_date: string;
  status: string;
  contracts: {
    contract_number: string;
    tenant_name: string | null;
    property_id: string;
    properties: {
      name: string;
    };
  };
}

export function usePendingRentals() {
  const { data: pendingRentals = [], isLoading, refetch } = useQuery({
    queryKey: ['pos', 'pending-rentals'],
    queryFn: async () => {
      // جلب الدفعات المعلقة مع بيانات العقد والعقار
      const { data, error } = await supabase
        .from('rental_payments')
        .select(`
          id,
          contract_id,
          amount_due,
          tax_amount,
          net_amount,
          due_date,
          status,
          contracts!inner(
            contract_number,
            tenant_name,
            property_id,
            properties!inner(name)
          )
        `)
        .in('status', ['معلق', 'متأخر'])
        .order('due_date', { ascending: true });

      if (error) throw error;

      return (data || []).map((item: RentalPaymentData) => {
        const today = new Date();
        const dueDate = new Date(item.due_date);
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: item.id,
          contract_id: item.contract_id,
          contract_number: item.contracts?.contract_number || '',
          property_name: item.contracts?.properties?.name || '',
          tenant_name: item.contracts?.tenant_name || '',
          amount_due: item.amount_due || 0,
          tax_amount: item.tax_amount || 0,
          net_amount: item.net_amount || item.amount_due || 0,
          due_date: item.due_date,
          status: item.status,
          days_overdue: daysOverdue > 0 ? daysOverdue : 0,
          is_overdue: daysOverdue > 0,
        } as PendingRental;
      });
    },
  });

  // إحصائيات
  const stats = {
    totalPending: pendingRentals.reduce((sum, r) => sum + r.amount_due, 0),
    overdueCount: pendingRentals.filter(r => r.is_overdue).length,
    overdueAmount: pendingRentals.filter(r => r.is_overdue).reduce((sum, r) => sum + r.amount_due, 0),
    pendingCount: pendingRentals.length,
  };

  return {
    pendingRentals,
    isLoading,
    stats,
    refetch,
  };
}
