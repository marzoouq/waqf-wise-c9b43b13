/**
 * Auth Service - خدمة المصادقة
 * 
 * إدارة تسجيل الدخول والمستخدمين والصلاحيات
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Tables']['user_roles']['Row'];

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
        .eq('id', userId)
        .single(),
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
}
