/**
 * Security Test Fixtures - بيانات اختبار الأمان
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
 */

export const mockAuditLogs: any[] = [];
export const mockSecurityEvents: any[] = [];
export const mockLoginAttempts: any[] = [];
export const mockRolePermissions: any[] = [];

export const securityTestUsers: Record<string, { id: string; email: string; role: string }> = {
  admin: { id: 'admin-1', email: 'admin@waqf.sa', role: 'admin' },
  nazer: { id: 'nazer-1', email: 'nazer@waqf.sa', role: 'nazer' },
};

export const auditLogFilters = {
  withUserId: { userId: 'user-admin-1' },
  withTableName: { tableName: 'beneficiaries' },
  withActionType: { actionType: 'update' },
  withSeverity: { severity: 'critical' },
  withDateRange: { startDate: '2024-01-01', endDate: '2024-01-31' },
};
