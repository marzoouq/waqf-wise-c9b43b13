/**
 * Translation Service
 * خدمة إدارة الترجمات
 */

import { supabase } from '@/integrations/supabase/client';

export interface Translation {
  key: string;
  ar: string;
  en: string | null;
  fr: string | null;
}

export const TranslationService = {
  /**
   * جلب جميع الترجمات
   */
  async fetchAll(): Promise<Translation[]> {
    const { data, error } = await supabase
      .from('translations')
      .select('key, ar, en, fr');

    if (error) throw error;
    return data || [];
  },

  /**
   * جلب ترجمة معينة بالمفتاح
   */
  async fetchByKey(key: string): Promise<Translation | null> {
    const { data, error } = await supabase
      .from('translations')
      .select('key, ar, en, fr')
      .eq('key', key)
      .maybeSingle();

    if (error) return null;
    return data;
  },

  /**
   * إضافة ترجمة جديدة
   */
  async create(translation: Omit<Translation, 'key'> & { key: string }): Promise<Translation> {
    const { data, error } = await supabase
      .from('translations')
      .insert(translation)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("فشل في إنشاء الترجمة");
    return data;
  },

  /**
   * تحديث ترجمة
   */
  async update(key: string, updates: Partial<Omit<Translation, 'key'>>): Promise<Translation> {
    const { data, error } = await supabase
      .from('translations')
      .update(updates)
      .eq('key', key)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("الترجمة غير موجودة");
    return data;
  },

  /**
   * حذف ترجمة (Soft Delete)
   * ⚠️ الحذف الفيزيائي ممنوع
   */
  async delete(key: string, reason: string = 'تم الإلغاء'): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('translations')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user?.id || null,
        deletion_reason: reason,
      })
      .eq('key', key);

    if (error) throw error;
  },

  /**
   * جلب جميع الترجمات (يستبعد المحذوفة)
   */
  async fetchAllActive(): Promise<Translation[]> {
    const { data, error } = await supabase
      .from('translations')
      .select('key, ar, en, fr')
      .is('deleted_at', null);

    if (error) throw error;
    return data || [];
  },
};
