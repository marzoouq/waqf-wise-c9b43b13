/**
 * User Service - خدمة المستخدمين
 */

import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";

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
}
