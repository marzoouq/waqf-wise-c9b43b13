/**
 * Hook for PaymentVouchers data fetching
 * يجلب سندات الدفع والقبض مع الفلترة والبحث
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PaymentVoucherWithDetails {
  id: string;
  voucher_number: string;
  voucher_type: string;
  amount: number;
  status: string;
  description: string;
  payment_method: string | null;
  reference_number: string | null;
  created_at: string;
  beneficiaries: {
    full_name: string;
    national_id: string;
  } | null;
  distributions: {
    total_amount: number;
    distribution_date: string;
  } | null;
}

export interface VoucherStats {
  total: number;
  draft: number;
  approved: number;
  paid: number;
  totalAmount: number;
}

export function usePaymentVouchersData(searchTerm: string, selectedStatus: string) {
  const {
    data: vouchers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["payment-vouchers", searchTerm, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('payment_vouchers')
        .select(`
          *,
          beneficiaries (full_name, national_id),
          distributions (total_amount, distribution_date)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`voucher_number.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (selectedStatus !== "all") {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PaymentVoucherWithDetails[];
    },
  });

  const stats: VoucherStats = {
    total: vouchers?.length || 0,
    draft: vouchers?.filter(v => v.status === 'draft').length || 0,
    approved: vouchers?.filter(v => v.status === 'approved').length || 0,
    paid: vouchers?.filter(v => v.status === 'paid').length || 0,
    totalAmount: vouchers?.reduce((sum, v) => sum + v.amount, 0) || 0,
  };

  return {
    vouchers: vouchers || [],
    stats,
    isLoading,
    error,
    refetch,
  };
}
