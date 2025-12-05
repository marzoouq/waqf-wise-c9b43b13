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

/**
 * أسماء الأدوار - متطابقة مع قاعدة البيانات (app_role enum)
 * Database roles: nazer, admin, accountant, cashier, archivist, user, waqf_heir, beneficiary
 */
export type RoleName = 
  | 'nazer' 
  | 'admin' 
  | 'accountant' 
  | 'cashier'           // موظف الصرف (was disbursement_officer)
  | 'archivist' 
  | 'user'              // مستخدم عادي
  | 'beneficiary'       // مستفيد
  | 'waqf_heir';        // وارث الوقف

export const ROLE_NAMES_AR: Record<RoleName, string> = {
  nazer: 'الناظر',
  admin: 'المشرف',
  accountant: 'المحاسب',
  cashier: 'موظف الصرف',
  archivist: 'أرشيفي',
  user: 'مستخدم',
  beneficiary: 'مستفيد',
  waqf_heir: 'وارث الوقف',
};
