/**
 * Permissions Service - خدمة الصلاحيات
 * إدارة صلاحيات الأدوار
 */

import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/types/roles";

export interface Permission {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface RolePermission {
  id: string;
  role: string;
  permission_id: string;
  granted: boolean;
  created_at: string;
}

export class PermissionsService {
  /**
   * جلب جميع الصلاحيات
   */
  static async getAllPermissions(): Promise<Permission[]> {
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
  static async getRolePermissions(role: AppRole): Promise<RolePermission[]> {
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
  static async updateRolePermission(
    role: AppRole, 
    permissionId: string, 
    granted: boolean
  ): Promise<void> {
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
   * جلب صلاحيات عدة أدوار
   */
  static async getPermissionsForRoles(roles: AppRole[]): Promise<RolePermission[]> {
    if (roles.length === 0) return [];

    const { data, error } = await supabase
      .from("role_permissions")
      .select("*")
      .in("role", roles)
      .eq("granted", true);

    if (error) throw error;
    return data || [];
  }

  /**
   * التحقق من صلاحية معينة لدور
   */
  static async hasPermission(role: AppRole, permissionName: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("role_permissions")
      .select(`
        granted,
        permissions!inner(name)
      `)
      .eq("role", role)
      .eq("permissions.name", permissionName)
      .eq("granted", true)
      .maybeSingle();

    if (error) return false;
    return !!data;
  }

  /**
   * جلب الصلاحيات حسب الفئة
   */
  static async getPermissionsByCategory(category: string): Promise<Permission[]> {
    const { data, error } = await supabase
      .from("permissions")
      .select("*")
      .eq("category", category)
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب الفئات الفريدة
   */
  static async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from("permissions")
      .select("category")
      .order("category", { ascending: true });

    if (error) throw error;
    
    const categories = new Set((data || []).map(p => p.category));
    return Array.from(categories);
  }
}
