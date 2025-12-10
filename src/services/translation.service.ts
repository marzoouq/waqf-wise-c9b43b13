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
      .single();

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
      .single();

    if (error) throw error;
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
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * حذف ترجمة
   */
  async delete(key: string): Promise<void> {
    const { error } = await supabase
      .from('translations')
      .delete()
      .eq('key', key);

    if (error) throw error;
  },
};
