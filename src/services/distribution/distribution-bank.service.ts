/**
 * Distribution Bank Service - خدمة التحويلات البنكية للتوزيعات
 * @version 1.0.0
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import { abortableFetch } from '@/lib/utils/abortable-fetch';
import type { Database } from '@/integrations/supabase/types';

type DistributionRow = Database['public']['Tables']['distributions']['Row'];

export class DistributionBankService {
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
  static async generateBankTransfer(
    distributionId: string,
    getDistribution: (id: string) => Promise<DistributionRow | null>,
    getVouchers: (id: string) => Promise<Database['public']['Tables']['payment_vouchers']['Row'][]>
  ): Promise<Database['public']['Tables']['bank_transfer_files']['Row']> {
    try {
      const distribution = await getDistribution(distributionId);
      if (!distribution) throw new Error('التوزيع غير موجود');

      const vouchers = await getVouchers(distributionId);
      
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
   * جلب تفاصيل التحويلات البنكية
   */
  static async getTransferDetails(transferFileId: string): Promise<{
    id: string;
    beneficiary_name: string;
    iban: string;
    amount: number;
    status: string;
    reference_number?: string | null;
    error_message?: string | null;
    processed_at?: string | null;
  }[]> {
    const { data, error } = await supabase
      .from('bank_transfer_details')
      .select('id, beneficiary_name, iban, amount, status, reference_number, error_message, processed_at')
      .eq('transfer_file_id', transferFileId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب توزيعات السنة المالية
   */
  static async getByFiscalYear(fiscalYearId: string): Promise<DistributionRow[]> {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const data = await abortableFetch<DistributionRow[]>(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/distributions?fiscal_year_id=eq.${fiscalYearId}&order=distribution_date.desc`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000,
        }
      );
      
      return data;
    } catch (error) {
      productionLogger.error('Error fetching fiscal year distributions', error);
      throw error;
    }
  }
}
