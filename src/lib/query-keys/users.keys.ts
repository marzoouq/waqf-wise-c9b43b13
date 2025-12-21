/**
 * Users & Auth Query Keys - مفاتيح استعلامات المستخدمين والصلاحيات
 */

export const USERS_KEYS = {
  // Users & Roles
  USER_ROLES: (userId: string) => ['user-roles', userId] as const,
  USER_ROLES_CHATBOT: (userId?: string) => ['user_roles_chatbot', userId] as const,
  USER_ROLES_AUDIT: ['user-roles-audit'] as const,
  USERS: ['users'] as const,
  USER: (id: string) => ['user', id] as const,
  USER_STATS: ['user-stats'] as const,
  
  // Profiles
  PROFILES: ['profiles'] as const,
  PROFILE: (userId?: string) => userId ? ['profile', userId] : ['profile'] as const,
  USERS_PROFILES_CACHE: ['users-profiles-cache'] as const,
  
  // Sessions & Permissions
  ACTIVE_SESSIONS: (userId?: string) => userId ? ['active-sessions', userId] : ['active-sessions'] as const,
  USER_PERMISSIONS: (userId?: string) => userId ? ['user-permissions', userId] : ['user-permissions'] as const,
  USER_PERMISSIONS_OVERRIDES: (userId?: string) => ['user-permissions-overrides', userId] as const,
  ALL_PERMISSIONS: ['all-permissions'] as const,
  ROLE_PERMISSIONS: (role?: string) => ['role-permissions', role] as const,
  AVAILABLE_USERS: ['available-users'] as const,

  // Two Factor
  TWO_FACTOR_STATUS: (userId?: string) => ['two-factor-status', userId] as const,
  BIOMETRIC_CREDENTIALS: ['biometric-credentials'] as const,

  // Security
  SECURITY_ALERTS: ['security-alerts'] as const,
  SECURITY_EVENTS: ['security-events'] as const,
  LOGIN_ATTEMPTS: ['login-attempts'] as const,
} as const;
