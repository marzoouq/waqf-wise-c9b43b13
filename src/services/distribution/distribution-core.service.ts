/**
 * Distribution Core Service - العمليات الأساسية للتوزيعات
 * @version 1.1.0 - إضافة الأرشفة التلقائية
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import { NotificationService } from '../notification.service';
import { archiveDocument, pdfToBlob } from '@/lib/archiveDocument';
import { generateDistributionPDF } from '@/lib/pdf/generateDistributionPDF';
import { logger } from '@/lib/logger';
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
        .select('beneficiary_id, beneficiaries(full_name), amount, status')
        .eq('distribution_id', id);

      if (vouchers && vouchers.length > 0) {
        const beneficiaryIds = vouchers.map(v => v.beneficiary_id).filter(Boolean) as string[];
        if (beneficiaryIds.length > 0) {
          await NotificationService.notifyDistributionApproved(id, beneficiaryIds);
        }

        // أرشفة التوزيع بعد الموافقة
        this.archiveDistribution(data, vouchers).catch(err => {
          logger.error(err, { context: 'distribution_auto_archive', severity: 'medium' });
        });
      }

      return data;
    } catch (error) {
      productionLogger.error('Error approving distribution', error);
      throw error;
    }
  }

  /**
   * أرشفة توزيع في نظام الأرشيف
   */
  static async archiveDistribution(
    distribution: DistributionRow, 
    vouchers?: { beneficiary_id: string | null; beneficiaries: { full_name: string } | null; amount: number | null; status: string | null }[]
  ): Promise<void> {
    try {
      // تحضير بيانات السندات
      const voucherData = vouchers?.map(v => ({
        beneficiary_name: v.beneficiaries?.full_name || 'غير محدد',
        amount: v.amount || 0,
        status: v.status || 'pending',
      })) || [];

      // توليد PDF - استخدام month كاسم التوزيع
      const distributionName = distribution.month || `توزيع ${distribution.id.slice(0, 8)}`;
      const pdfDoc = await generateDistributionPDF({
        id: distribution.id,
        name: distributionName,
        distribution_date: distribution.distribution_date || new Date().toISOString().split('T')[0],
        total_amount: distribution.total_amount || 0,
        beneficiaries_count: distribution.beneficiaries_count || 0,
        status: distribution.status || 'draft',
        distribution_type: distribution.distribution_type || undefined,
        notes: distribution.notes || undefined,
        approved_by: distribution.approved_by || undefined,
        approved_at: distribution.approved_at || undefined,
      }, voucherData);

      const pdfBlob = pdfToBlob(pdfDoc);
      const fileName = `توزيع_${distributionName}_${new Date().toISOString().split('T')[0]}.pdf`;

      await archiveDocument({
        fileBlob: pdfBlob,
        fileName,
        fileType: 'distribution',
        referenceId: distribution.id,
        referenceType: 'distribution',
        description: `تقرير التوزيع - ${distributionName} - ${distribution.beneficiaries_count} مستفيد`,
      });

      logger.info('تم أرشفة التوزيع بنجاح', { 
        context: 'distribution_archived', 
        metadata: { distributionId: distribution.id } 
      });
    } catch (error) {
      logger.error(error, { context: 'archive_distribution_error', severity: 'medium' });
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
