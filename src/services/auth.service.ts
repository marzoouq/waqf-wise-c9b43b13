/**
 * Auth Service - خدمة المصادقة
 * 
 * إدارة تسجيل الدخول والمستخدمين والصلاحيات
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type UserRoleRow = Database['public']['Tables']['user_roles']['Row'];
type AppRole = Database['public']['Enums']['app_role'];

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  roles: string[];
  created_at: string;
}

export interface LoginResult {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

export class AuthService {
  /**
   * تسجيل الدخول بالبريد الإلكتروني
   */
  static async login(email: string, password: string): Promise<LoginResult> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const userProfile = await this.getUserProfile(data.user.id);
    return { success: true, user: userProfile || undefined };
  }

  /**
   * تسجيل الخروج
   */
  static async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  /**
   * جلب الجلسة الحالية
   */
  static async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  /**
   * جلب المستخدم الحالي
   */
  static async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return this.getUserProfile(user.id);
  }

  /**
   * جلب ملف المستخدم مع الأدوار
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const [profileRes, rolesRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, created_at')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId),
    ]);

    if (profileRes.error || !profileRes.data) return null;

    return {
      ...profileRes.data,
      roles: (rolesRes.data || []).map(r => r.role),
    };
  }

  /**
   * جلب أدوار المستخدم
   */
  static async getUserRoles(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (error) throw error;
    return (data || []).map(r => r.role);
  }

  /**
   * التحقق من صلاحية معينة
   */
  static async hasRole(userId: string, role: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.includes(role);
  }

  /**
   * التحقق من صلاحيات متعددة
   */
  static async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return roles.some(role => userRoles.includes(role));
  }

  /**
   * تحديث كلمة المرور
   */
  static async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  /**
   * طلب إعادة تعيين كلمة المرور
   */
  static async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  // ==================== إدارة المستخدمين ====================

  /**
   * جلب قائمة المستخدمين مع أدوارهم
   */
  static async getUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const usersWithRoles = await Promise.all(
      (data || []).map(async (profile) => {
        const { data: rolesData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", profile.user_id);

        return {
          ...profile,
          user_roles: rolesData || [],
        };
      })
    );

    return usersWithRoles;
  }

  /**
   * حذف مستخدم
   */
  static async deleteUser(userId: string): Promise<void> {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
  }

  /**
   * تحديث أدوار المستخدم
   */
  static async updateUserRoles(userId: string, roles: AppRole[]): Promise<void> {
    await supabase.from("user_roles").delete().eq("user_id", userId);

    if (roles.length > 0) {
      const rolesToInsert = roles.map(role => ({ 
        user_id: userId, 
        role
      }));

      const { error } = await supabase
        .from("user_roles")
        .insert(rolesToInsert);

      if (error) throw error;
    }
  }

  /**
   * تحديث حالة المستخدم
   */
  static async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: isActive })
      .eq("user_id", userId);

    if (error) throw error;
  }

  // ==================== إدارة الصلاحيات ====================

  /**
   * جلب جميع الصلاحيات
   */
  static async getAllPermissions() {
    const { data, error } = await supabase
      .from("permissions")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب صلاحيات دور معين
   */
  static async getRolePermissions(role: AppRole) {
    const { data, error } = await supabase
      .from("role_permissions")
      .select("*")
      .eq("role", role);

    if (error) throw error;
    return data || [];
  }

  /**
   * تحديث صلاحية لدور
   */
  static async updateRolePermission(role: AppRole, permissionId: string, granted: boolean): Promise<void> {
    const { error } = await supabase.from("role_permissions").upsert(
      {
        role,
        permission_id: permissionId,
        granted,
      },
      {
        onConflict: "role,permission_id",
      }
    );

    if (error) throw error;
  }

  /**
   * جلب ملف الشخصية
   */
  static async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_id, full_name, email, phone, position, avatar_url, created_at, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * تحديث أو إنشاء ملف الشخصية
   */
  static async upsertProfile(userId: string, profileData: Record<string, any>) {
    const { data, error } = await supabase
      .from("profiles")
      .upsert([{ ...profileData, user_id: userId }], { onConflict: "user_id" })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("فشل في تحديث الملف الشخصي");
    return data;
  }

  // ==================== المصادقة الثنائية ====================

  /**
   * جلب حالة المصادقة الثنائية
   */
  static async get2FAStatus(userId: string) {
    const { data, error } = await supabase
      .from("two_factor_secrets")
      .select("enabled, secret, backup_codes")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * تفعيل المصادقة الثنائية
   */
  static async enable2FA(userId: string, secret: string, backupCodes: string[]): Promise<void> {
    const { error } = await supabase
      .from("two_factor_secrets")
      .upsert({
        user_id: userId,
        secret: secret,
        backup_codes: backupCodes,
        enabled: true,
      });

    if (error) throw error;
  }

  /**
   * إلغاء المصادقة الثنائية
   */
  static async disable2FA(userId: string): Promise<void> {
    const { error } = await supabase
      .from("two_factor_secrets")
      .update({ enabled: false })
      .eq("user_id", userId);

    if (error) throw error;
  }

  // ==================== إعدادات الإشعارات ====================

  /**
   * جلب إعدادات الإشعارات
   */
  static async getNotificationSettings(userId: string) {
    const { data, error } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * تحديث إعدادات الإشعارات
   */
  static async updateNotificationSettings(userId: string, settings: Record<string, boolean>): Promise<void> {
    const { data: existing } = await supabase
      .from("notification_settings")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("notification_settings")
        .update(settings)
        .eq("user_id", userId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("notification_settings")
        .insert({ user_id: userId, ...settings });
      if (error) throw error;
    }
  }
}
