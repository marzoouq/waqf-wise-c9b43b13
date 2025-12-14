/**
 * Hook for PaymentVouchers data fetching
 * يجلب سندات الدفع والقبض مع الفلترة والبحث
 */

import { useQuery } from "@tanstack/react-query";
import { VoucherService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

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
    queryKey: QUERY_KEYS.PAYMENT_VOUCHERS_FILTERED(searchTerm, selectedStatus),
    queryFn: () => VoucherService.getWithFilters(searchTerm, selectedStatus),
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
