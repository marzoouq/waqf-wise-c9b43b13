/**
 * Distribution Core Service - العمليات الأساسية للتوزيعات
 * @version 1.0.0
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import { NotificationService } from '../notification.service';
import type { Database } from '@/integrations/supabase/types';

type DistributionRow = Database['public']['Tables']['distributions']['Row'];
type DistributionInsert = Database['public']['Tables']['distributions']['Insert'];

export interface DistributionSummary {
  totalDistributions: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
  averagePerBeneficiary: number;
}

export class DistributionCoreService {
  /**
   * جلب جميع التوزيعات
   */
  static async getAll(status?: string): Promise<DistributionRow[]> {
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
  static async create(distribution: Omit<DistributionInsert, 'id' | 'created_at' | 'updated_at'>): Promise<DistributionRow> {
    try {
      const { data, error } = await supabase
        .from('distributions')
        .insert([distribution])
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
      const { data, error } = await supabase
        .from('distributions')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // إرسال إشعارات للمستفيدين
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

      return data;
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

    return beneficiaryIds.map(id => ({
      beneficiary_id: id,
      amount: Math.round((totalAmount / beneficiaryIds.length) * 100) / 100,
    }));
  }
}
