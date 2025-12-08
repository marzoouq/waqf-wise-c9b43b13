/**
 * Settings Service - خدمة الإعدادات
 * @version 2.8.28
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type LandingSettingRow = Database['public']['Tables']['landing_page_settings']['Row'];

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
}
