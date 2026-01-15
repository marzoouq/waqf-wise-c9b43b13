/**
 * Distribution Voucher Service - خدمة سندات التوزيع
 * @version 1.0.0
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';

export interface VoucherRecord {
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

export interface VoucherStats {
  total: number;
  draft: number;
  approved: number;
  paid: number;
  totalAmount: number;
  paidAmount: number;
}

export class DistributionVoucherService {
  /**
   * جلب سندات التوزيع
   */
  static async getVouchers(distributionId: string): Promise<Database['public']['Tables']['payment_vouchers']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('payment_vouchers')
        .select('*')
        .eq('distribution_id', distributionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching distribution vouchers', error);
      throw error;
    }
  }

  /**
   * إنشاء سند صرف
   */
  static async createVoucher(voucher: Database['public']['Tables']['payment_vouchers']['Insert']): Promise<Database['public']['Tables']['payment_vouchers']['Row']> {
    try {
      const { data, error } = await supabase
        .from('payment_vouchers')
        .insert([voucher])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('فشل إنشاء السند');
      return data;
    } catch (error) {
      productionLogger.error('Error creating voucher', error);
      throw error;
    }
  }

  /**
   * جلب سندات التوزيع مع التفاصيل
   */
  static async getDistributionVouchersWithDetails(distributionId: string): Promise<VoucherRecord[]> {
    try {
      const { data, error } = await supabase
        .from('payment_vouchers_with_details')
        .select('id, voucher_number, voucher_type, beneficiary_id, amount, status, created_at, description, payment_method, bank_account_id, reference_number, notes, approved_by, approved_at, paid_by, paid_at')
        .eq('distribution_id', distributionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching distribution vouchers with details', error);
      throw error;
    }
  }

  /**
   * جلب إحصائيات سندات التوزيع
   */
  static async getDistributionVoucherStats(distributionId: string): Promise<VoucherStats> {
    try {
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
    } catch (error) {
      productionLogger.error('Error fetching distribution voucher stats', error);
      throw error;
    }
  }

  /**
   * جلب قائمة سندات الصرف
   */
  static async getPaymentVouchersList() {
    try {
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
    } catch (error) {
      productionLogger.error('Error fetching payment vouchers list', error);
      throw error;
    }
  }
}
