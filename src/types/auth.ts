/**
 * أنواع المصادقة والأدوار
 * Auth Types - Unified definitions
 * @version 2.9.2
 */

// Re-export from roles.ts for backward compatibility
export type { AppRole, AllRole, WorkflowRole } from './roles';
export { ROLE_LABELS, SYSTEM_ROLES, ROLE_COLORS, ROLE_PRIORITY, ROLE_DASHBOARD_MAP } from './roles';

// ==================== User Profile (Unified) ====================
/**
 * ملف تعريف المستخدم الموحد
 * يُستخدم في جميع أنحاء التطبيق
 */
export interface UserProfile {
  id: string;
  user_id?: string;
  email: string;
  full_name: string | null;
  phone?: string | null;
  position?: string | null;
  avatar_url?: string | null;
  is_active?: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at?: string;
  roles?: string[];
  user_roles?: Array<{ role: string }>;
}

// ==================== Role Interface ====================
export interface Role {
  id: string;
  role_name: string;
  role_name_ar: string;
  description: string | null;
  permissions: string[];
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== Profile Interface ====================
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  user_id?: string | null;
  position?: string | null;
  roles?: Role;
}

// ==================== User Permission ====================
export interface UserPermission {
  id: string;
  user_id: string;
  permission_key: string;
  granted: boolean;
  granted_by: string | null;
  granted_at: string;
  expires_at: string | null;
}

// ==================== User Session ====================
export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address: string | null;
  user_agent: string | null;
  started_at: string;
  last_activity_at: string;
  ended_at: string | null;
}

// ==================== Login Result ====================
export interface LoginResult {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

// تم نقل RoleName إلى src/config/permissions.ts - استخدم AppRole أو استورد من هناك
export type { RoleName } from '@/config/permissions';
