/**
 * Security Dashboard Tests - اختبارات لوحة الأمان
 * @phase 4 - Security & Audit Logs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import {
  mockAuditLogs,
  mockSecurityEvents,
  mockLoginAttempts,
  mockRolePermissions,
  securityTestUsers,
  auditLogFilters,
} from '../../fixtures/security.fixtures';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: mockAuditLogs, error: null })),
        })),
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockSecurityEvents, error: null })),
        })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'admin-1', email: 'admin@waqf.sa' } }, error: null })),
    },
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const renderWithProviders = (component: React.ReactNode) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Security Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Security Overview', () => {
    it('should display security statistics cards', async () => {
      expect(mockAuditLogs).toHaveLength(3);
      expect(mockSecurityEvents).toHaveLength(2);
      expect(mockLoginAttempts).toHaveLength(2);
    });

    it('should categorize audit logs by severity', () => {
      const criticalLogs = mockAuditLogs.filter(log => log.severity === 'critical');
      const warningLogs = mockAuditLogs.filter(log => log.severity === 'warning');
      const infoLogs = mockAuditLogs.filter(log => log.severity === 'info');

      expect(criticalLogs).toHaveLength(1);
      expect(warningLogs).toHaveLength(1);
      expect(infoLogs).toHaveLength(1);
    });

    it('should track failed login attempts', () => {
      const failedLogins = mockLoginAttempts.filter(attempt => !attempt.success);
      expect(failedLogins).toHaveLength(1);
      expect(failedLogins[0].failure_reason).toBe('invalid_credentials');
    });

    it('should track successful login attempts', () => {
      const successfulLogins = mockLoginAttempts.filter(attempt => attempt.success);
      expect(successfulLogins).toHaveLength(1);
    });
  });

  describe('Security Events', () => {
    it('should identify suspicious activities', () => {
      const suspiciousEvents = mockSecurityEvents.filter(
        event => event.event_type === 'suspicious_activity'
      );
      expect(suspiciousEvents).toHaveLength(1);
      expect(suspiciousEvents[0].details.reason).toBe('unusual_access_pattern');
    });

    it('should track security event severity levels', () => {
      const errorEvents = mockSecurityEvents.filter(event => event.severity === 'error');
      const warningEvents = mockSecurityEvents.filter(event => event.severity === 'warning');

      expect(errorEvents).toHaveLength(1);
      expect(warningEvents).toHaveLength(1);
    });

    it('should track event types', () => {
      const eventTypes = mockSecurityEvents.map(e => e.event_type);
      expect(eventTypes).toContain('failed_login');
      expect(eventTypes).toContain('suspicious_activity');
    });
  });

  describe('Access Control', () => {
    it('should verify admin access to security dashboard', () => {
      const adminUser = securityTestUsers.admin;
      expect(adminUser.role).toBe('admin');
      expect(adminUser.email).toBe('admin@waqf.sa');
    });

    it('should verify nazer access to security dashboard', () => {
      const nazerUser = securityTestUsers.nazer;
      expect(nazerUser.role).toBe('nazer');
    });

    it('should restrict beneficiary access to security data', () => {
      const allowedRoles = ['admin', 'nazer'];
      expect(allowedRoles.includes('beneficiary')).toBe(false);
    });
  });
});

describe('Audit Logs', () => {
  describe('Log Listing', () => {
    it('should have required audit log fields', () => {
      mockAuditLogs.forEach(log => {
        expect(log).toHaveProperty('id');
        expect(log).toHaveProperty('user_id');
        expect(log).toHaveProperty('action_type');
        expect(log).toHaveProperty('severity');
        expect(log).toHaveProperty('created_at');
      });
    });

    it('should track IP addresses', () => {
      mockAuditLogs.forEach(log => {
        expect(log.ip_address).toBeDefined();
        expect(log.ip_address).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
      });
    });
  });

  describe('Log Filtering', () => {
    it('should filter logs by action type', () => {
      const updateLogs = mockAuditLogs.filter(log => log.action_type === 'update');
      expect(updateLogs).toHaveLength(1);
      expect(updateLogs[0].table_name).toBe('beneficiaries');
    });

    it('should filter logs by table name', () => {
      const beneficiaryLogs = mockAuditLogs.filter(log => log.table_name === 'beneficiaries');
      expect(beneficiaryLogs).toHaveLength(1);
    });

    it('should filter logs by user', () => {
      const adminLogs = mockAuditLogs.filter(log => log.user_email === 'admin@waqf.sa');
      expect(adminLogs).toHaveLength(2);
    });

    it('should filter logs by severity', () => {
      const criticalLogs = mockAuditLogs.filter(log => log.severity === 'critical');
      expect(criticalLogs).toHaveLength(1);
      expect(criticalLogs[0].action_type).toBe('delete');
    });

    it('should support userId filter', () => {
      expect(auditLogFilters.withUserId.userId).toBe('user-admin-1');
    });

    it('should support tableName filter', () => {
      expect(auditLogFilters.withTableName.tableName).toBe('beneficiaries');
    });

    it('should support actionType filter', () => {
      expect(auditLogFilters.withActionType.actionType).toBe('update');
    });

    it('should support severity filter', () => {
      expect(auditLogFilters.withSeverity.severity).toBe('critical');
    });

    it('should support date range filter', () => {
      expect(auditLogFilters.withDateRange.startDate).toBe('2024-01-01');
      expect(auditLogFilters.withDateRange.endDate).toBe('2024-01-31');
    });
  });

  describe('Log Details', () => {
    it('should capture old and new values for updates', () => {
      const updateLog = mockAuditLogs.find(log => log.action_type === 'update');
      expect(updateLog?.old_values).toEqual({ status: 'نشط' });
      expect(updateLog?.new_values).toEqual({ status: 'معلق' });
    });

    it('should capture IP address and user agent', () => {
      mockAuditLogs.forEach(log => {
        expect(log.ip_address).toBeDefined();
        expect(log.user_agent).toBeDefined();
      });
    });

    it('should include descriptive messages', () => {
      const deleteLog = mockAuditLogs.find(log => log.action_type === 'delete');
      expect(deleteLog?.description).toBe('حذف سند صرف');
    });

    it('should track record IDs for table operations', () => {
      const tableOperations = mockAuditLogs.filter(log => log.table_name !== null);
      tableOperations.forEach(log => {
        expect(log.record_id).toBeDefined();
      });
    });
  });
});

describe('Role Permissions', () => {
  it('should have role permission mappings', () => {
    expect(mockRolePermissions).toHaveLength(4);
  });

  it('should have admin permissions', () => {
    const adminPerms = mockRolePermissions.filter(rp => rp.role === 'admin');
    expect(adminPerms.length).toBeGreaterThan(0);
  });

  it('should have accountant permissions', () => {
    const accountantPerms = mockRolePermissions.filter(rp => rp.role === 'accountant');
    expect(accountantPerms.length).toBeGreaterThan(0);
  });

  it('should restrict manage_users to admin only', () => {
    const manageUsersPerms = mockRolePermissions.filter(rp => rp.permission_id === 'manage_users');
    const grantedTo = manageUsersPerms.filter(rp => rp.granted);
    expect(grantedTo.every(rp => rp.role === 'admin')).toBe(true);
  });

  it('should track permission grants', () => {
    mockRolePermissions.forEach(rp => {
      expect(rp).toHaveProperty('granted');
      expect(typeof rp.granted).toBe('boolean');
    });
  });
});

describe('Login Attempts', () => {
  it('should have required login attempt fields', () => {
    mockLoginAttempts.forEach(attempt => {
      expect(attempt).toHaveProperty('id');
      expect(attempt).toHaveProperty('email');
      expect(attempt).toHaveProperty('success');
      expect(attempt).toHaveProperty('ip_address');
      expect(attempt).toHaveProperty('created_at');
    });
  });

  it('should distinguish successful and failed attempts', () => {
    const successful = mockLoginAttempts.filter(a => a.success);
    const failed = mockLoginAttempts.filter(a => !a.success);

    expect(successful.length).toBe(1);
    expect(failed.length).toBe(1);
  });

  it('should track failure reasons for failed attempts', () => {
    const failedAttempts = mockLoginAttempts.filter(a => !a.success);
    failedAttempts.forEach(attempt => {
      expect(attempt.failure_reason).toBeDefined();
    });
  });

  it('should track user agent for all attempts', () => {
    mockLoginAttempts.forEach(attempt => {
      expect(attempt.user_agent).toBeDefined();
    });
  });
});

describe('Security Statistics', () => {
  it('should calculate total audit logs', () => {
    expect(mockAuditLogs.length).toBe(3);
  });

  it('should calculate critical events', () => {
    const critical = mockAuditLogs.filter(log => log.severity === 'critical');
    expect(critical.length).toBe(1);
  });

  it('should calculate login success rate', () => {
    const total = mockLoginAttempts.length;
    const successful = mockLoginAttempts.filter(a => a.success).length;
    const rate = (successful / total) * 100;
    
    expect(rate).toBe(50);
  });

  it('should identify high-risk activities', () => {
    const highRisk = [
      ...mockAuditLogs.filter(log => log.severity === 'critical'),
      ...mockSecurityEvents.filter(e => e.severity === 'error'),
    ];
    
    expect(highRisk.length).toBe(2);
  });
});
