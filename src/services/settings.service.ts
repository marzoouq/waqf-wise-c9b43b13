/**
 * Settings Service - خدمة الإعدادات
 * @version 2.8.65
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type LandingSettingRow = Database['public']['Tables']['landing_page_settings']['Row'];

export interface ZATCASetting {
  key: string;
  value: string;
}

export class SettingsService {
  /**
   * جلب إعدادات الصفحة الترحيبية
   */
  static async getLandingSettings(): Promise<LandingSettingRow[]> {
    const { data, error } = await supabase
      .from('landing_page_settings')
      .select('*')
      .order('setting_key');

    if (error) throw error;
    return data || [];
  }

  /**
   * تحديث إعداد
   */
  static async updateSetting(key: string, value: string): Promise<void> {
    const { error } = await supabase
      .from('landing_page_settings')
      .update({ setting_value: value })
      .eq('setting_key', key);

    if (error) throw error;
  }

  /**
   * حفظ إعدادات ZATCA
   */
  static async saveZATCASettings(settings: ZATCASetting[]): Promise<void> {
    for (const { key, value } of settings) {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          setting_type: 'text',
          category: 'zatca',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;
    }
  }

  /**
   * جلب إعدادات ZATCA
   */
  static async getZATCASettings(): Promise<Record<string, string>> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value')
      .eq('category', 'zatca');

    if (error) throw error;

    const settings: Record<string, string> = {};
    (data || []).forEach(item => {
      settings[item.setting_key] = item.setting_value;
    });
    return settings;
  }

  /**
   * جلب إعدادات المنظمة
   */
  static async getOrganizationSettings() {
    const { data, error } = await supabase
      .from('organization_settings')
      .select('id, organization_name_ar, organization_name_en, address_ar, phone, email, logo_url, vat_registration_number, commercial_registration_number')
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
