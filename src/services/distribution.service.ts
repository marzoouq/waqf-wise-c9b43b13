/**
 * Distribution Service - خدمة إدارة التوزيعات
 * 
 * تحتوي على منطق الأعمال المتعلق بتوزيعات الوقف
 * @version 2.8.44
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import { NotificationService } from './notification.service';
import type { Database } from '@/integrations/supabase/types';

// استخدام Types من Supabase مباشرة
type DistributionRow = Database['public']['Tables']['distributions']['Row'];
type DistributionInsert = Database['public']['Tables']['distributions']['Insert'];
type PaymentVoucherRow = Database['public']['Tables']['payment_vouchers']['Row'];
type PaymentVoucherInsert = Database['public']['Tables']['payment_vouchers']['Insert'];
type BankTransferFileRow = Database['public']['Tables']['bank_transfer_files']['Row'];

export interface DistributionApproval {
  id: string;
  distribution_id: string;
  level: number;
  status: string;
  approver_name: string;
  notes: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface ApprovalHistoryItem {
  id: string;
  action: string;
  notes: string | null;
  performed_by_name: string | null;
  created_at: string;
}

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

export interface DistributionSummary {
  totalDistributions: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
  averagePerBeneficiary: number;
}

export class DistributionService {
  /**
   * جلب جميع التوزيعات
   */
  static async getAll(status?: string) {
    try {
      const query = supabase
        .from('distributions')
        .select('*')
        .order('distribution_date', { ascending: false });

      const { data, error } = status && status !== 'all' 
        ? await query.eq('status', status)
        : await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching distributions', error);
      throw error;
    }
  }

  /**
   * جلب توزيعات الوريث
   */
  static async getHeirDistributions(beneficiaryId: string) {
    try {
      const { data, error } = await supabase
        .from('heir_distributions')
        .select(`
          id,
          share_amount,
          heir_type,
          distribution_date,
          fiscal_year_id,
          fiscal_years (
            name,
            is_closed
          )
        `)
        .eq('beneficiary_id', beneficiaryId)
        .order('distribution_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching heir distributions', error);
      throw error;
    }
  }

  /**
   * جلب توزيع واحد
   */
  static async getById(id: string): Promise<DistributionRow | null> {
    try {
      const { data, error } = await supabase
        .from('distributions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error fetching distribution', error);
      throw error;
    }
  }

  /**
   * إنشاء توزيع جديد
   */
  static async create(distribution: Record<string, unknown>) {
    try {
      const { data, error } = await supabase
        .from('distributions')
        .insert([distribution as never])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error creating distribution', error);
      throw error;
    }
  }

  /**
   * تحديث توزيع
   */
  static async update(id: string, updates: Partial<DistributionInsert>): Promise<DistributionRow> {
    try {
      const { data, error } = await supabase
        .from('distributions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error updating distribution', error);
      throw error;
    }
  }

  /**
   * حذف توزيع (فقط المسودات)
   */
  static async delete(id: string): Promise<void> {
    try {
      // التحقق من الحالة أولاً
      const distribution = await this.getById(id);
      if (distribution && distribution.status !== 'draft') {
        throw new Error('لا يمكن حذف توزيع غير مسودة');
      }

      const { error } = await supabase
        .from('distributions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error deleting distribution', error);
      throw error;
    }
  }

  /**
   * الموافقة على توزيع
   */
  static async approve(id: string, approvedBy: string): Promise<DistributionRow> {
    try {
      const distribution = await this.update(id, {
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      });

      // إرسال إشعارات للمستفيدين من payment_vouchers
      const { data: vouchers } = await supabase
        .from('payment_vouchers')
        .select('beneficiary_id')
        .eq('distribution_id', id);

      if (vouchers && vouchers.length > 0) {
        const beneficiaryIds = vouchers.map(v => v.beneficiary_id).filter(Boolean) as string[];
        if (beneficiaryIds.length > 0) {
          await NotificationService.notifyDistributionApproved(id, beneficiaryIds);
        }
      }

      return distribution;
    } catch (error) {
      productionLogger.error('Error approving distribution', error);
      throw error;
    }
  }

  /**
   * رفض توزيع
   */
  static async reject(id: string, reason: string): Promise<DistributionRow> {
    return this.update(id, {
      status: 'cancelled',
      notes: reason,
    });
  }

  /**
   * جلب ملخص التوزيعات
   */
  static async getSummary(): Promise<DistributionSummary> {
    try {
      const { data, error } = await supabase
        .from('distributions')
        .select('total_amount, status, beneficiaries_count');

      if (error) throw error;

      const distributions = data || [];
      const totalAmount = distributions.reduce((sum, d) => sum + (d.total_amount || 0), 0);
      const paidAmount = distributions
        .filter(d => d.status === 'paid')
        .reduce((sum, d) => sum + (d.total_amount || 0), 0);
      const totalBeneficiaries = distributions.reduce((sum, d) => sum + (d.beneficiaries_count || 0), 0);

      return {
        totalDistributions: distributions.length,
        totalAmount,
        pendingAmount: totalAmount - paidAmount,
        paidAmount,
        averagePerBeneficiary: totalBeneficiaries > 0 ? totalAmount / totalBeneficiaries : 0,
      };
    } catch (error) {
      productionLogger.error('Error fetching distribution summary', error);
      throw error;
    }
  }

  /**
   * محاكاة توزيع
   */
  static simulate(params: {
    totalAmount: number;
    beneficiaryIds: string[];
    distributionMethod: 'equal' | 'weighted' | 'custom';
  }): { beneficiary_id: string; amount: number }[] {
    const { totalAmount, beneficiaryIds, distributionMethod } = params;

    if (distributionMethod === 'equal') {
      const amountPerBeneficiary = totalAmount / beneficiaryIds.length;
      return beneficiaryIds.map(id => ({
        beneficiary_id: id,
        amount: Math.round(amountPerBeneficiary * 100) / 100,
      }));
    }

    // للأساليب الأخرى، توزيع متساوي كـ fallback
    return beneficiaryIds.map(id => ({
      beneficiary_id: id,
      amount: Math.round((totalAmount / beneficiaryIds.length) * 100) / 100,
    }));
  }

  /**
   * جلب توزيعات مستفيد معين
   */
  static async getByBeneficiary(beneficiaryId: string): Promise<DistributionRow[]> {
    try {
      // جلب التوزيعات من خلال payment_vouchers
      const { data: vouchers, error: vouchersError } = await supabase
        .from('payment_vouchers')
        .select('distribution_id')
        .eq('beneficiary_id', beneficiaryId);

      if (vouchersError) throw vouchersError;

      if (!vouchers || vouchers.length === 0) return [];

      const distributionIds = [...new Set(vouchers.map(v => v.distribution_id).filter(Boolean))];
      
      if (distributionIds.length === 0) return [];

      const { data, error } = await supabase
        .from('distributions')
        .select('*')
        .in('id', distributionIds as string[])
        .order('distribution_date', { ascending: false });

      if (error) throw error;
      return (data as unknown as DistributionRow[]) || [];
    } catch (error) {
      productionLogger.error('Error fetching beneficiary distributions', error);
      throw error;
    }
  }

  /**
   * جلب الجدول الزمني للتوزيع
   */
  static async getTimeline(distributionId: string): Promise<{
    events: { date: string; action: string; user?: string; notes?: string }[];
  }> {
    try {
      const distribution = await this.getById(distributionId);
      if (!distribution) throw new Error('التوزيع غير موجود');

      const events: { date: string; action: string; user?: string; notes?: string }[] = [];

      events.push({
        date: distribution.created_at,
        action: 'إنشاء التوزيع',
      });

      if (distribution.approved_at) {
        events.push({
          date: distribution.approved_at,
          action: 'الموافقة على التوزيع',
          user: distribution.approved_by || undefined,
        });
      }

      if (distribution.status === 'paid') {
        events.push({
          date: distribution.updated_at,
          action: 'تم الصرف',
        });
      }

      return { events };
    } catch (error) {
      productionLogger.error('Error fetching distribution timeline', error);
      throw error;
    }
  }

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
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error creating voucher', error);
      throw error;
    }
  }

  /**
   * رفع كشف حساب بنكي للإفصاح
   */
  static async uploadBankStatement(disclosureId: string, file: File): Promise<string> {
    try {
      const filePath = `disclosures/${disclosureId}/bank_statement_${Date.now()}.pdf`;
      
      const { error: uploadError } = await supabase.storage
        .from('disclosure-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('disclosure-documents')
        .getPublicUrl(filePath);

      await supabase
        .from('annual_disclosures')
        .update({ bank_statement_url: urlData.publicUrl })
        .eq('id', disclosureId);

      return urlData.publicUrl;
    } catch (error) {
      productionLogger.error('Error uploading bank statement', error);
      throw error;
    }
  }

  /**
   * إنشاء ملف تحويل بنكي
   */
  static async generateBankTransfer(distributionId: string): Promise<Database['public']['Tables']['bank_transfer_files']['Row']> {
    try {
      const distribution = await this.getById(distributionId);
      if (!distribution) throw new Error('التوزيع غير موجود');

      const vouchers = await this.getVouchers(distributionId);
      
      // إنشاء ملف التحويل
      const fileNumber = `BTF-${Date.now()}`;
      const totalAmount = vouchers.reduce((sum, v) => sum + (v.amount || 0), 0);

      const { data, error } = await supabase
        .from('bank_transfer_files')
        .insert([{
          file_number: fileNumber,
          distribution_id: distributionId,
          file_format: 'CSV',
          total_transactions: vouchers.length,
          total_amount: totalAmount,
          status: 'pending',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error generating bank transfer', error);
      throw error;
    }
  }

  /**
   * تتبع حالة التحويل
   */
  static async trackTransferStatus(transferId: string): Promise<Database['public']['Tables']['bank_transfer_files']['Row']> {
    try {
      const { data, error } = await supabase
        .from('bank_transfer_files')
        .select('*')
        .eq('id', transferId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error tracking transfer status', error);
      throw error;
    }
  }

  /**
   * اختيار المستفيدين للتوزيع
   */
  static async selectBeneficiaries(query: {
    status?: string;
    category?: string;
    hasBank?: boolean;
  }): Promise<{ id: string; full_name: string; iban: string | null }[]> {
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('id, full_name, iban')
        .eq('status', query.status || 'active')
        .order('full_name');

      if (error) throw error;
      
      let filtered = data || [];
      if (query.category) {
        filtered = filtered.filter(b => true); // category filter would go here
      }
      if (query.hasBank) {
        filtered = filtered.filter(b => !!b.iban);
      }
      
      return filtered;
    } catch (error) {
      productionLogger.error('Error selecting beneficiaries', error);
      throw error;
    }
  }

  /**
   * جلب توزيعات السنة المالية
   */
  static async getByFiscalYear(fiscalYearId: string): Promise<DistributionRow[]> {
    try {
      // @ts-expect-error - تجاوز خطأ TypeScript المعقد
      const result = await supabase
        .from('distributions')
        .select('*')
        .eq('fiscal_year_id', fiscalYearId)
        .order('distribution_date', { ascending: false });

      if (result.error) throw result.error;
      return result.data || [];
    } catch (error) {
      productionLogger.error('Error fetching fiscal year distributions', error);
      throw error;
    }
  }

  /**
   * جلب موافقات التوزيع
   */
  static async getDistributionApprovals(distributionId: string): Promise<DistributionApproval[]> {
    try {
      const { data, error } = await supabase
        .from('distribution_approvals')
        .select('id, distribution_id, level, status, approver_name, notes, approved_at, created_at')
        .eq('distribution_id', distributionId)
        .order('level', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching distribution approvals', error);
      throw error;
    }
  }

  /**
   * جلب سجل موافقات التوزيع
   */
  static async getDistributionHistory(distributionId: string): Promise<ApprovalHistoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('approval_history')
        .select('id, action, notes, performed_by_name, created_at')
        .eq('reference_id', distributionId)
        .eq('approval_type', 'distribution')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching distribution history', error);
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

  /**
   * جلب أفراد العائلة
   */
  static async getFamilyMembers(familyName: string) {
    try {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("id, full_name, national_id, relationship, gender, date_of_birth, status, is_head_of_family")
        .eq("family_name", familyName)
        .order("is_head_of_family", { ascending: false })
        .order("full_name");

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error fetching family members', error);
      throw error;
    }
  }

  /**
   * جلب مستفيدي الإفصاح
   */
  static async getDisclosureBeneficiaries(disclosureId: string) {
    try {
      const { data, error } = await supabase
        .from("disclosure_beneficiaries")
        .select("*")
        .eq("disclosure_id", disclosureId);
      
      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error fetching disclosure beneficiaries', error);
      throw error;
    }
  }
}
