/**
 * Distribution Tabs Data Hooks - خطافات بيانات تبويبات التوزيعات
 * @version 2.8.35
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ==================== Types ====================
interface DistributionApproval {
  id: string;
  distribution_id: string;
  level: number;
  status: string;
  approver_name: string;
  notes: string | null;
  approved_at: string | null;
  created_at: string;
}

interface ApprovalHistoryItem {
  id: string;
  action: string;
  notes: string | null;
  performed_by_name: string | null;
  created_at: string;
}

interface VoucherRecord {
  id: string;
  voucher_number: string;
  voucher_type?: string;
  beneficiary_id?: string;
  amount: number;
  status: string;
  created_at: string;
  description?: string;
  payment_method?: string;
  bank_account_id?: string;
  reference_number?: string;
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  paid_by?: string;
  paid_at?: string;
}

interface VoucherStats {
  total: number;
  draft: number;
  approved: number;
  paid: number;
  totalAmount: number;
  paidAmount: number;
}

// ==================== Distribution Timeline Hook ====================
export function useDistributionTimeline(distributionId: string | undefined) {
  const approvalsQuery = useQuery({
    queryKey: ['distribution-timeline-approvals', distributionId],
    queryFn: async (): Promise<DistributionApproval[]> => {
      if (!distributionId) return [];

      const { data, error } = await supabase
        .from('distribution_approvals')
        .select('id, distribution_id, level, status, approver_name, notes, approved_at, created_at')
        .eq('distribution_id', distributionId)
        .order('level', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!distributionId,
  });

  const historyQuery = useQuery({
    queryKey: ['distribution-timeline-history', distributionId],
    queryFn: async (): Promise<ApprovalHistoryItem[]> => {
      if (!distributionId) return [];

      const { data, error } = await supabase
        .from('approval_history')
        .select('id, action, notes, performed_by_name, created_at')
        .eq('reference_id', distributionId)
        .eq('approval_type', 'distribution')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!distributionId,
  });

  return {
    approvals: approvalsQuery.data,
    history: historyQuery.data,
    isLoading: approvalsQuery.isLoading || historyQuery.isLoading,
  };
}

// ==================== Distribution Vouchers Hook ====================
export function useDistributionVouchers(distributionId: string) {
  const vouchersQuery = useQuery({
    queryKey: ["distribution-vouchers-tab", distributionId],
    queryFn: async (): Promise<VoucherRecord[]> => {
      const { data, error } = await supabase
        .from('payment_vouchers_with_details')
        .select('id, voucher_number, voucher_type, beneficiary_id, amount, status, created_at, description, payment_method, bank_account_id, reference_number, notes, approved_by, approved_at, paid_by, paid_at')
        .eq('distribution_id', distributionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const statsQuery = useQuery({
    queryKey: ["distribution-vouchers-stats-tab", distributionId],
    queryFn: async (): Promise<VoucherStats> => {
      const { data, error } = await supabase
        .from('payment_vouchers')
        .select('amount, status')
        .eq('distribution_id', distributionId);

      if (error) throw error;

      return {
        total: data.length,
        draft: data.filter(v => v.status === 'draft').length,
        approved: data.filter(v => v.status === 'approved').length,
        paid: data.filter(v => v.status === 'paid').length,
        totalAmount: data.reduce((sum, v) => sum + v.amount, 0),
        paidAmount: data.filter(v => v.status === 'paid').reduce((sum, v) => sum + v.amount, 0),
      };
    },
  });

  return {
    vouchers: vouchersQuery.data,
    stats: statsQuery.data,
    isLoading: vouchersQuery.isLoading,
    refetch: vouchersQuery.refetch,
  };
}

// ==================== Payment Vouchers List Hook ====================
export function usePaymentVouchersList() {
  return useQuery({
    queryKey: ["payment-vouchers-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_vouchers")
        .select(`
          *,
          beneficiaries (
            full_name,
            national_id
          ),
          distributions (
            distribution_name: month
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });
}

// ==================== Family Members Dialog Hook ====================
export function useFamilyMembersDialog(familyName: string, enabled: boolean) {
  return useQuery({
    queryKey: ["family-members-dialog", familyName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("id, full_name, national_id, relationship, gender, date_of_birth, status, is_head_of_family")
        .eq("family_name", familyName)
        .order("is_head_of_family", { ascending: false })
        .order("full_name");

      if (error) throw error;
      return data;
    },
    enabled,
  });
}

export type { DistributionApproval, ApprovalHistoryItem, VoucherRecord, VoucherStats };
