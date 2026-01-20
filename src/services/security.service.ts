/**
 * Security Service - خدمة الأمان
 * @version 2.8.42
 */

import { supabase } from "@/integrations/supabase/client";
import { abortableFetch } from "@/lib/utils/abortable-fetch";
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
      .maybeSingle();

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

  /**
   * جلب تجاوزات صلاحيات المستخدم
   */
  static async getUserPermissionOverrides(userId: string) {
    const { data, error } = await supabase
      .from("user_permissions")
      .select("*")
      .eq("user_id", userId);
    
    if (error) throw error;
    return data || [];
  }

  /**
   * إضافة أو تحديث تجاوز صلاحية للمستخدم
   */
  static async upsertUserPermissionOverride(userId: string, permissionKey: string, granted: boolean): Promise<void> {
    const { error } = await supabase
      .from("user_permissions")
      .upsert({
        user_id: userId,
        permission_key: permissionKey,
        granted,
        granted_at: new Date().toISOString()
      });
    
    if (error) throw error;
  }

  /**
   * حذف تجاوز صلاحية من المستخدم (Soft Delete)
   */
  static async removeUserPermissionOverride(userId: string, permissionKey: string, reason: string = 'إلغاء الصلاحية'): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from("user_permissions")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: userData?.user?.id || null,
        deletion_reason: reason,
      })
      .eq("user_id", userId)
      .eq("permission_key", permissionKey);
    
    if (error) throw error;
  }

  /**
   * حفظ نتيجة فحص كلمة المرور المسربة
   * @note Using abortableFetch for timeout support
   */
  static async saveLeakedPasswordCheck(userId: string, passwordHash: string, isLeaked: boolean) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    await abortableFetch(`${supabaseUrl}/rest/v1/leaked_password_checks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        user_id: userId,
        password_hash: passwordHash,
        is_leaked: isLeaked,
      }),
      timeout: 10000, // 10 ثواني
    });
  }

  /**
   * الحصول على المستخدم الحالي
   */
  static async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  }
}
