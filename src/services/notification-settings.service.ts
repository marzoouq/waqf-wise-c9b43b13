/**
 * Notification Settings Service - خدمة إعدادات الإشعارات
 * @version 2.8.29
 */

import { supabase } from "@/integrations/supabase/client";
import type { NotificationSettings } from "@/types/notifications";

export class NotificationSettingsService {
  /**
   * جلب إعدادات الإشعارات للمستخدم الحالي
   */
  static async getSettings(): Promise<NotificationSettings | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data as NotificationSettings | null;
  }

  /**
   * تحديث إعدادات الإشعارات
   */
  static async updateSettings(settingsId: string | undefined, updates: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    if (settingsId) {
      const { data, error } = await supabase
        .from("notification_settings")
        .update(updates)
        .eq("id", settingsId)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("إعدادات الإشعارات غير موجودة");
      return data as NotificationSettings;
    } else {
      const { data, error } = await supabase
        .from("notification_settings")
        .insert([{ ...updates, user_id: user.id }])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("فشل في إنشاء إعدادات الإشعارات");
      return data as NotificationSettings;
    }
  }
}
