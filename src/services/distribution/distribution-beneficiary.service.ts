/**
 * Distribution Beneficiary Service - خدمة توزيعات المستفيدين
 * @version 1.0.0
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';

type DistributionRow = Database['public']['Tables']['distributions']['Row'];

export class DistributionBeneficiaryService {
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
   * جلب توزيعات مستفيد معين
   */
  static async getByBeneficiary(beneficiaryId: string): Promise<DistributionRow[]> {
    try {
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
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching beneficiary distributions', error);
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
        .select('id, full_name, iban, category')
        .eq('status', query.status || 'active')
        .order('full_name');

      if (error) throw error;
      
      let filtered = data || [];
      if (query.category) {
        filtered = filtered.filter(b => b.category === query.category);
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

  /**
   * جلب المستفيدين للقائمة المنسدلة
   */
  static async getBeneficiariesForSelector(): Promise<{
    id: string;
    full_name: string;
    national_id: string;
    category: string;
  }[]> {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('id, full_name, national_id, category')
      .in('status', ['نشط', 'active'])
      .order('full_name');
    if (error) throw error;
    return data || [];
  }

  /**
   * حساب التوزيع الشرعي
   */
  static async calculateShariahDistribution(totalAmount: number): Promise<{
    beneficiary_id: string;
    heir_type: string;
    share_amount: number;
    share_percentage: number;
  }[]> {
    const { data, error } = await supabase.rpc("calculate_shariah_distribution", {
      p_total_amount: totalAmount,
    });

    if (error) throw error;
    return data || [];
  }
}
