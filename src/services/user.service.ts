/**
 * User Service - خدمة المستخدمين
 */

import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";
import type { AppRole } from "@/types/roles";

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminCount: number;
  recentUsers: Array<{
    id: string;
    email: string;
    created_at: string;
    last_login_at?: string;
  }>;
}

export class UserService {
  /**
   * جلب إحصائيات المستخدمين
   */
  static async getUserStats(): Promise<UserStats> {
    const [usersResponse, profilesResponse] = await Promise.all([
      supabase
        .from("user_roles")
        .select("user_id, role, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      
      supabase
        .from("profiles")
        .select("id, email, created_at, last_login_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    if (usersResponse.error) throw usersResponse.error;
    if (profilesResponse.error) throw profilesResponse.error;

    const usersData = usersResponse.data || [];
    const profilesData = profilesResponse.data || [];

    const uniqueUsers = new Set(usersData.map(u => u.user_id));
    const adminUsers = usersData.filter(u => u.role === 'admin');

    const recentUsers = profilesData.map(user => ({
      id: user.id,
      email: user.email || '',
      created_at: user.created_at,
      last_login_at: user.last_login_at,
    }));

    return {
      totalUsers: uniqueUsers.size,
      activeUsers: recentUsers.filter(u => u.last_login_at).length,
      adminCount: new Set(adminUsers.map(u => u.user_id)).size,
      recentUsers,
    };
  }

  /**
   * جلب الجلسات النشطة
   */
  static async getActiveSessions(userId: string) {
    const { data, error } = await supabase
      .from("user_sessions")
      .select("id, user_id, session_token, ip_address, user_agent, device_info, is_active, last_activity_at, created_at")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("last_activity_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * إنهاء جلسة
   */
  static async endSession(sessionId: string, userId: string) {
    const { error } = await supabase.rpc("end_user_session", {
      p_session_id: sessionId,
      p_user_id: userId,
    });

    if (error) throw error;
  }

  /**
   * إنهاء جميع الجلسات الأخرى
   */
  static async endAllOtherSessions(userId: string, currentToken: string) {
    const { error } = await supabase
      .from("user_sessions")
      .update({ 
        is_active: false,
        ended_at: new Date().toISOString()
      })
      .eq("user_id", userId)
      .neq("session_token", currentToken || "");

    if (error) throw error;
  }

  /**
   * جلب صلاحيات المستخدم
   */
  static async getUserPermissions(userId: string) {
    // Get user's roles
    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (rolesError) throw rolesError;
    if (!userRoles || userRoles.length === 0) return [];

    const roles = userRoles.map(r => r.role);

    // Get role permissions
    const { data: rolePermissions, error: rolePermsError } = await supabase
      .from("role_permissions")
      .select(`
        permission_id,
        granted,
        permissions (
          id,
          name,
          category,
          description
        )
      `)
      .in("role", roles)
      .eq("granted", true);

    if (rolePermsError) throw rolePermsError;

    // Get user-specific permission overrides
    const { data: userPermissions, error: userPermsError } = await supabase
      .from("user_permissions")
      .select(`
        permission_key,
        granted
      `)
      .eq("user_id", userId);

    if (userPermsError) {
      productionLogger.error("Error fetching user permissions:", userPermsError);
    }

    return { rolePermissions, userPermissions };
  }

  /**
   * جلب أدوار المستخدم
   */
  static async getUserRoles(userId: string) {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) throw error;
    return data?.map(r => r.role) || [];
  }

  /**
   * جلب المستخدمين مع أدوارهم
   * يستخدم دالة: get_all_user_profiles()
   */
  static async getUsersWithRoles(): Promise<{
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    roles: string[];
    roles_array: string[];
    roles_count: number;
  }[]> {
    // استخدام الدالة الآمنة بدلاً من الـ View المحذوف
    const { data, error } = await supabase.rpc("get_all_user_profiles");

    if (error) throw error;
    
    return (data || []).map((u) => {
      // استخراج الأدوار من user_roles JSON array
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userRoles = u.user_roles as any;
      const rolesArray: string[] = Array.isArray(userRoles) 
        ? userRoles.map((r: { role: string }) => r.role)
        : [];
      
      return {
        id: u.id as string,
        user_id: (u.user_id || u.id) as string,
        full_name: (u.full_name || u.email || "") as string,
        email: (u.email || "") as string,
        avatar_url: (u.avatar_url || null) as string | null,
        roles: rolesArray,
        roles_array: rolesArray,
        roles_count: rolesArray.length,
      };
    });
  }

  /**
   * جلب سجل تغييرات الأدوار
   */
  static async getRolesAuditLog() {
    const { data, error } = await supabase
      .from("user_roles_audit")
      .select("*")
      .order("changed_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  }

  /**
   * إضافة دور للمستخدم
   */
  static async addRole(userId: string, role: AppRole): Promise<void> {
    const { error } = await supabase
      .from("user_roles")
      .insert([{ user_id: userId, role }]);
    if (error) throw error;
  }

  /**
   * حذف دور من المستخدم
   */
  static async removeRole(userId: string, role: AppRole): Promise<void> {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);
    if (error) throw error;
  }

  /**
   * جلب المستخدمين المتاحين للرسائل
   */
  static async getAvailableUsers() {
    const { data, error } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .limit(200);
      
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    const userIds = [...new Set(data.map(u => u.user_id))];
    const { data: beneficiaries } = await supabase
      .from("beneficiaries")
      .select("user_id, full_name, beneficiary_number")
      .in("user_id", userIds);
      
    const userMap = new Map<string, { id: string; name: string; roles: string[] }>();
    
    data.forEach(u => {
      const beneficiary = beneficiaries?.find(b => b.user_id === u.user_id);
      const existingUser = userMap.get(u.user_id);
      
      if (existingUser) {
        existingUser.roles.push(u.role);
      } else {
        userMap.set(u.user_id, {
          id: u.user_id,
          name: beneficiary?.full_name || 
                (u.role === 'nazer' ? 'الناظر' : 
                 u.role === 'admin' ? 'المشرف' :
                 u.role === 'accountant' ? 'المحاسب' :
                 u.role === 'cashier' ? 'أمين الصندوق' :
                 u.role === 'archivist' ? 'الأرشيفي' :
                 beneficiary?.beneficiary_number || 'مستخدم'),
          roles: [u.role]
        });
      }
    });
    
    return Array.from(userMap.values())
      .map(u => ({
        ...u,
        displayName: `${u.name} (${u.roles.join(', ')})`,
        role: u.roles[0]
      }))
      .sort((a, b) => {
        const roleOrder: Record<string, number> = {
          nazer: 1, admin: 2, accountant: 3, cashier: 4, archivist: 5, beneficiary: 6, user: 7
        };
        return (roleOrder[a.role] || 999) - (roleOrder[b.role] || 999);
      });
  }

  // Aliases للتوافق الخلفي
  static getUserRolesForManager = UserService.getUserRoles;
  static addUserRole = UserService.addRole;
  static deleteUserRole = UserService.removeRole;
}
