/**
 * Security Service - خدمة الأمان
 * @version 2.8.28
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SecurityEventRow = Database['public']['Tables']['security_events_log']['Row'];
type LoginAttemptRow = Database['public']['Tables']['login_attempts_log']['Row'];

export class SecurityService {
  /**
   * جلب أحداث الأمان
   */
  static async getSecurityEvents(limit = 50): Promise<SecurityEventRow[]> {
    const { data, error } = await supabase
      .from("security_events_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب محاولات تسجيل الدخول
   */
  static async getLoginAttempts(limit = 20): Promise<LoginAttemptRow[]> {
    const { data, error } = await supabase
      .from("login_attempts_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب دور المستخدم
   */
  static async getUserRole(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (error) return null;
    return data?.role || null;
  }
}
