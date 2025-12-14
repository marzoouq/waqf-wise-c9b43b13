/**
 * أنواع المصادقة والأدوار
 * Role types aligned with database enum: app_role
 */

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

export interface UserPermission {
  id: string;
  user_id: string;
  permission_key: string;
  granted: boolean;
  granted_by: string | null;
  granted_at: string;
  expires_at: string | null;
}

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

// تم نقل تعريفات الأدوار إلى src/types/roles.ts
// Re-export for backward compatibility
export type { AppRole } from './roles';
export { ROLE_LABELS, SYSTEM_ROLES } from './roles';

/** @deprecated استخدم AppRole بدلاً من RoleName */
export type RoleName = 
  | 'nazer' 
  | 'admin' 
  | 'accountant' 
  | 'cashier'
  | 'archivist' 
  | 'user'
  | 'beneficiary'
  | 'waqf_heir';
