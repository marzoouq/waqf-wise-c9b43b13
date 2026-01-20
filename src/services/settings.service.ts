/**
 * Settings Service - خدمة الإعدادات
 * @version 2.9.2
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";

type LandingSettingRow = Database['public']['Tables']['landing_page_settings']['Row'];
type SavedFilterRow = Database['public']['Tables']['saved_filters']['Row'];

export interface ZATCASetting {
  key: string;
  value: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  filter_type: string;
  filter_criteria: Json;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
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

  // =====================
  // Saved Filters Methods (from useSavedFilters)
  // =====================

  /**
   * جلب الفلاتر المحفوظة
   */
  static async getSavedFilters(userId: string, filterType: string): Promise<SavedFilter[]> {
    const { data, error } = await supabase
      .from('saved_filters')
      .select('id, name, filter_type, filter_criteria, is_favorite, created_at, updated_at')
      .eq('user_id', userId)
      .eq('filter_type', filterType)
      .order('is_favorite', { ascending: false })
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []) as SavedFilter[];
  }

  /**
   * حفظ فلتر جديد
   */
  static async saveFilter(
    userId: string,
    filterData: { name: string; filter_type: string; filter_criteria: Json; is_favorite: boolean }
  ): Promise<SavedFilter> {
    const { data, error } = await supabase
      .from('saved_filters')
      .insert({
        user_id: userId,
        ...filterData,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('فشل حفظ الفلتر');
    return data as SavedFilter;
  }

  /**
   * تحديث فلتر
   */
  static async updateFilter(id: string, updates: Partial<SavedFilter>): Promise<void> {
    const { error } = await supabase
      .from('saved_filters')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * حذف فلتر (Soft Delete)
   * ⚠️ الحذف الفيزيائي ممنوع
   */
  static async deleteFilter(id: string, reason: string = 'تم الإلغاء'): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('saved_filters')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: userData?.user?.id || null,
        deletion_reason: reason,
      })
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * تبديل المفضلة
   */
  static async toggleFilterFavorite(id: string, currentValue: boolean): Promise<void> {
    const { error } = await supabase
      .from('saved_filters')
      .update({ is_favorite: !currentValue })
      .eq('id', id);

    if (error) throw error;
  }
}
