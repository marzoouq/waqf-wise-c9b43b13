/**
 * Auth Service - خدمة المصادقة
 * 
 * المسؤوليات:
 * - تسجيل الدخول والخروج
 * - إدارة الجلسات
 * - إدارة كلمات المرور
 * - إدارة الملفات الشخصية
 * 
 * الخدمات المنفصلة:
 * - PermissionsService: إدارة الصلاحيات
 * - TwoFactorService: المصادقة الثنائية
 * - UserService: إدارة المستخدمين
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export interface BeneficiaryEmailResult {
  email: string;
  user_id: string;
}
import { type UserProfile, type LoginResult } from "@/types/auth";
import { type AppRole } from "@/types/roles";

// ملاحظة: PermissionsService و TwoFactorService يتم تصديرهم مباشرة من services/index.ts
// لا نعيد التصدير هنا لتجنب التكرار

type UserRoleRow = Database['public']['Tables']['user_roles']['Row'];

// Re-export for backward compatibility
export type { UserProfile, LoginResult } from "@/types/auth";

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
   * تسجيل الدخول باستخدام Google OAuth
   */
  static async loginWithGoogle(): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/redirect`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  /**
   * تسجيل الخروج الشامل مع تنظيف كامل للجلسة
   * ✅ ينظف: localStorage, sessionStorage, caches, service workers, supabase session
   */
  static async logout(options?: { keepTheme?: boolean; scope?: 'local' | 'global' }): Promise<void> {
    const keysToKeep = options?.keepTheme !== false ? [
      'theme',
      'vite-ui-theme',
      'language',
      'i18nextLng',
    ] : [];

    // 1. حفظ القيم المهمة
    const savedValues: Record<string, string> = {};
    keysToKeep.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) savedValues[key] = value;
    });

    // 2. تنظيف localStorage (ما عدا المحفوظ)
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToKeep.includes(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // 3. تنظيف sessionStorage بالكامل
    sessionStorage.clear();

    // 4. استعادة القيم المحفوظة
    Object.entries(savedValues).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    // 5. تنظيف caches و service workers
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }
    } catch (e) {
      console.warn('Cache cleanup warning:', e);
    }

    // 6. تسجيل الخروج من Supabase (global = جميع الأجهزة)
    try {
      await supabase.auth.signOut({ scope: options?.scope || 'global' });
    } catch (e) {
      // تجاهل أخطاء الخروج - قد تكون الجلسة منتهية أصلاً
      console.warn('SignOut warning:', e);
    }
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
        .eq('user_id', userId)
        .is('deleted_at', null), // استبعاد السجلات المحذوفة
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
      .eq('user_id', userId)
      .is('deleted_at', null); // استبعاد السجلات المحذوفة
    
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
   * جلب بريد المستفيد برقم الهوية الوطنية
   * للاستخدام في تسجيل دخول المستفيدين
   */
  static async getBeneficiaryEmailByNationalId(nationalId: string): Promise<BeneficiaryEmailResult | null> {
    const { data, error } = await supabase
      .rpc('get_beneficiary_email_by_national_id', { 
        p_national_id: nationalId 
      });

    if (error) {
      throw new Error('حدث خطأ في البحث عن رقم الهوية');
    }

    if (!data || data.length === 0) {
      return null;
    }

    return {
      email: data[0].email,
      user_id: data[0].user_id,
    };
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
   * تغيير كلمة المرور (مع التحقق من كلمة المرور الحالية)
   */
  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    // التحقق من كلمة المرور الحالية
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return { success: false, error: 'المستخدم غير موجود' };
    }
    
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    
    if (verifyError) {
      return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
    }
    
    // تحديث كلمة المرور
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
   * ✅ محسّن: استعلامين فقط بدلاً من N+1
   */
  static async getUsers() {
    // استعلام واحد لجلب جميع الملفات الشخصية
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) throw profilesError;
    if (!profiles || profiles.length === 0) return [];

    // استعلام واحد لجلب جميع الأدوار
    const userIds = profiles.map(p => p.user_id).filter(Boolean);
    const { data: allRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", userIds)
      .is("deleted_at", null); // استبعاد السجلات المحذوفة

    if (rolesError) throw rolesError;

    // تجميع الأدوار حسب المستخدم في الذاكرة
    const rolesMap = new Map<string, Array<{ role: string }>>();
    (allRoles || []).forEach(r => {
      const existing = rolesMap.get(r.user_id) || [];
      existing.push({ role: r.role });
      rolesMap.set(r.user_id, existing);
    });

    // دمج البيانات
    return profiles.map(profile => ({
      ...profile,
      user_roles: rolesMap.get(profile.user_id) || [],
    }));
  }

  /**
   * حذف مستخدم (Soft Delete للـ profiles فقط)
   * ملاحظة: user_roles لا تحتوي على أعمدة soft delete - الـ trigger سيمنع الحذف
   */
  static async deleteUser(userId: string): Promise<void> {
    // Soft delete profile فقط
    const { error } = await supabase
      .from("profiles")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: userId,
        deletion_reason: 'حذف المستخدم'
      })
      .eq("user_id", userId);

    if (error) throw error;
  }

  /**
   * تحديث أدوار المستخدم (Soft Delete للأدوار القديمة ثم إضافة الجديدة)
   */
  static async updateUserRoles(userId: string, roles: AppRole[]): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    
    // Soft-delete الأدوار الحالية بدلاً من الحذف الفيزيائي
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("user_roles")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user?.user?.id || null,
        deletion_reason: 'تحديث أدوار المستخدم'
      })
      .eq("user_id", userId)
      .is("deleted_at", null);

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

  // ==================== الملف الشخصي ====================

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
  static async upsertProfile(userId: string, profileData: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("profiles")
      .upsert([{ ...profileData, user_id: userId }], { onConflict: "user_id" })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("فشل في تحديث الملف الشخصي");
    return data;
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

  // ==================== إعادة تعيين كلمة المرور للمستخدم ====================

  /**
   * إعادة تعيين كلمة مرور مستخدم آخر (للمشرفين)
   */
  static async resetUserPassword(userId: string, newPassword: string): Promise<{ success: boolean }> {
    const { data, error } = await supabase.functions.invoke('reset-user-password', {
      body: { user_id: userId, new_password: newPassword }
    });
    
    if (error) throw error;
    return data || { success: true };
  }
}
