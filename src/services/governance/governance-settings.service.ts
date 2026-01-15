/**
 * Governance Settings Service - خدمة إعدادات الحوكمة
 * @version 1.0.0
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';

export class GovernanceSettingsService {
  /**
   * جلب إعدادات الرؤية
   */
  static async getVisibilitySettings(targetRole: 'beneficiary' | 'waqf_heir') {
    try {
      const { data, error } = await supabase
        .from('beneficiary_visibility_settings')
        .select('*')
        .eq('target_role', targetRole)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error fetching visibility settings', error);
      throw error;
    }
  }

  /**
   * إنشاء إعدادات الرؤية الافتراضية
   */
  static async createDefaultVisibilitySettings(targetRole: 'beneficiary' | 'waqf_heir') {
    try {
      const defaultSettings = {
        target_role: targetRole,
        show_overview: true,
        show_profile: true,
        show_requests: true,
        show_distributions: true,
        show_statements: true,
        show_properties: true,
        show_documents: true,
        show_bank_accounts: true,
        show_financial_reports: true,
        show_approvals_log: true,
        show_disclosures: true,
        show_governance: true,
        show_budgets: true,
        show_other_beneficiaries_names: true,
        show_other_beneficiaries_amounts: false,
        show_other_beneficiaries_personal_data: false,
        show_family_tree: true,
        show_total_beneficiaries_count: true,
        show_beneficiary_categories: true,
        show_beneficiaries_statistics: true,
        show_inactive_beneficiaries: false,
        mask_iban: true,
        mask_phone_numbers: true,
        mask_exact_amounts: false,
        mask_tenant_info: true,
        mask_national_ids: true,
      };

      const { data, error } = await supabase
        .from('beneficiary_visibility_settings')
        .insert(defaultSettings)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("فشل في إنشاء إعدادات الرؤية");
      return data;
    } catch (error) {
      productionLogger.error('Error creating default visibility settings', error);
      throw error;
    }
  }

  /**
   * تحديث إعدادات الرؤية
   */
  static async updateVisibilitySettings(id: string, updates: Record<string, unknown>) {
    try {
      const { data, error } = await supabase
        .from('beneficiary_visibility_settings')
        .update(updates as never)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("إعدادات الرؤية غير موجودة");
      return data;
    } catch (error) {
      productionLogger.error('Error updating visibility settings', error);
      throw error;
    }
  }

  /**
   * جلب إعدادات المنظمة
   */
  static async getOrganizationSettings() {
    try {
      const { data, error } = await supabase
        .from('organization_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error fetching organization settings', error);
      throw error;
    }
  }

  /**
   * تحديث إعدادات المنظمة
   */
  static async updateOrganizationSettings(id: string | undefined, updates: Record<string, unknown>) {
    try {
      if (id) {
        const { data, error } = await supabase
          .from('organization_settings')
          .update(updates as never)
          .eq('id', id)
          .select()
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("إعدادات المنظمة غير موجودة");
        return data;
      } else {
        const { data, error } = await supabase
          .from('organization_settings')
          .insert([updates as never])
          .select()
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("فشل في إنشاء إعدادات المنظمة");
        return data;
      }
    } catch (error) {
      productionLogger.error('Error updating organization settings', error);
      throw error;
    }
  }
}
