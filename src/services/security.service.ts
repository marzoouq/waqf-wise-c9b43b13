/**
 * Security Service - خدمة الأمان
 * @version 2.8.42
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SecurityEventRow = Database['public']['Tables']['security_events_log']['Row'];
type LoginAttemptRow = Database['public']['Tables']['login_attempts_log']['Row'];
type RolePermissionRow = Database['public']['Tables']['role_permissions']['Row'];

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

  /**
   * جلب صلاحيات دور معين
   */
  static async getRolePermissions(role: string): Promise<RolePermissionRow[]> {
    const { data, error } = await supabase
      .from("role_permissions")
      .select("*")
      .eq("role", role as RolePermissionRow['role']);
    
    if (error) throw error;
    return data || [];
  }

  /**
   * تحديث أو إضافة صلاحية لدور
   */
  static async upsertRolePermission(role: string, permissionId: string, granted: boolean): Promise<void> {
    const { error } = await supabase
      .from("role_permissions")
      .upsert({
        role: role as RolePermissionRow['role'],
        permission_id: permissionId,
        granted
      }, {
        onConflict: 'role,permission_id'
      });
    
    if (error) throw error;
  }
}
