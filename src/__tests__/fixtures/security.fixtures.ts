/**
 * Security Test Fixtures - بيانات اختبار الأمان
 * @version 1.0.0
 */

export const mockAuditLogs = [
  {
    id: 'audit-1',
    user_id: 'user-admin-1',
    user_email: 'admin@waqf.sa',
    action_type: 'login',
    table_name: null,
    record_id: null,
    old_values: null,
    new_values: null,
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0',
    description: 'تسجيل دخول ناجح',
    severity: 'info' as const,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'audit-2',
    user_id: 'user-admin-1',
    user_email: 'admin@waqf.sa',
    action_type: 'update',
    table_name: 'beneficiaries',
    record_id: 'ben-1',
    old_values: { status: 'نشط' },
    new_values: { status: 'معلق' },
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0',
    description: 'تحديث حالة مستفيد',
    severity: 'warning' as const,
    created_at: '2024-01-15T11:00:00Z',
  },
  {
    id: 'audit-3',
    user_id: 'user-nazer-1',
    user_email: 'nazer@waqf.test',
    action_type: 'delete',
    table_name: 'payment_vouchers',
    record_id: 'pv-1',
    old_values: { amount: 5000 },
    new_values: null,
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0',
    description: 'حذف سند صرف',
    severity: 'critical' as const,
    created_at: '2024-01-15T12:00:00Z',
  },
];

export const mockSecurityEvents = [
  {
    id: 'sec-1',
    event_type: 'failed_login',
    user_id: null,
    user_email: 'unknown@test.com',
    ip_address: '192.168.1.200',
    user_agent: 'Mozilla/5.0',
    details: { attempts: 3 },
    severity: 'warning',
    created_at: '2024-01-15T09:00:00Z',
  },
  {
    id: 'sec-2',
    event_type: 'suspicious_activity',
    user_id: 'user-1',
    user_email: 'user@test.com',
    ip_address: '10.0.0.1',
    user_agent: 'Curl/7.0',
    details: { reason: 'unusual_access_pattern' },
    severity: 'error',
    created_at: '2024-01-15T10:30:00Z',
  },
];

export const mockLoginAttempts = [
  {
    id: 'login-1',
    email: 'admin@waqf.sa',
    success: true,
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0',
    created_at: '2024-01-15T08:00:00Z',
  },
  {
    id: 'login-2',
    email: 'hacker@test.com',
    success: false,
    ip_address: '192.168.1.200',
    user_agent: 'Bot/1.0',
    failure_reason: 'invalid_credentials',
    created_at: '2024-01-15T09:00:00Z',
  },
];

export const mockRolePermissions = [
  {
    id: 'rp-1',
    role: 'admin',
    permission_id: 'view_all_beneficiaries',
    granted: true,
  },
  {
    id: 'rp-2',
    role: 'admin',
    permission_id: 'manage_users',
    granted: true,
  },
  {
    id: 'rp-3',
    role: 'accountant',
    permission_id: 'view_financial_reports',
    granted: true,
  },
  {
    id: 'rp-4',
    role: 'accountant',
    permission_id: 'manage_users',
    granted: false,
  },
];

export const auditLogFilters = {
  withUserId: { userId: 'user-admin-1' },
  withTableName: { tableName: 'beneficiaries' },
  withActionType: { actionType: 'update' },
  withSeverity: { severity: 'critical' },
  withDateRange: { startDate: '2024-01-01', endDate: '2024-01-31' },
};
