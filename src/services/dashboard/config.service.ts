/**
 * Dashboard Config Service - خدمة تكوينات لوحة التحكم
 */

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export const DashboardConfigService = {
  /**
   * جلب تكوينات لوحة التحكم
   */
  async getDashboardConfigs() {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('dashboard_configurations')
      .select('id, user_id, dashboard_name, layout_config, is_default, is_shared, created_at, updated_at')
      .or(`user_id.eq.${user?.id},is_shared.eq.true`)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * حفظ تكوين لوحة التحكم
   */
  async saveDashboardConfig(config: { dashboard_name: string; layout_config: Json; is_default: boolean; is_shared: boolean }) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('dashboard_configurations')
      .insert([{
        dashboard_name: config.dashboard_name,
        layout_config: config.layout_config,
        is_default: config.is_default,
        is_shared: config.is_shared,
        user_id: user?.id,
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('فشل إنشاء لوحة التحكم');
    return data;
  },

  /**
   * تحديث تكوين لوحة التحكم
   */
  async updateDashboardConfig(id: string, config: { dashboard_name?: string; layout_config?: unknown; is_default?: boolean; is_shared?: boolean }) {
    const updateData: Record<string, unknown> = {};
    if (config.dashboard_name) updateData.dashboard_name = config.dashboard_name;
    if (config.layout_config) updateData.layout_config = config.layout_config;
    if (config.is_default !== undefined) updateData.is_default = config.is_default;
    if (config.is_shared !== undefined) updateData.is_shared = config.is_shared;
    
    const { data, error } = await supabase
      .from('dashboard_configurations')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('لوحة التحكم غير موجودة');
    return data;
  },

  /**
   * حذف تكوين لوحة التحكم
   */
  async deleteDashboardConfig(id: string) {
    const { error } = await supabase
      .from('dashboard_configurations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
