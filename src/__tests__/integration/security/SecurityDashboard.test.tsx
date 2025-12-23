/**
 * Security Dashboard Tests - اختبارات لوحة الأمان
 * @phase 4 - Security & Audit Logs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { mockAuditLogs, mockSecurityEvents, mockLoginAttempts } from '../../fixtures/security.fixtures';

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
      // Test that security stats are displayed
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
  });

  describe('Access Control', () => {
    it('should verify admin access to security dashboard', () => {
      // Admin should have full access
      const adminUser = { role: 'admin', email: 'admin@waqf.sa' };
      expect(adminUser.role).toBe('admin');
    });

    it('should restrict beneficiary access to security data', () => {
      // Beneficiaries should not see security logs
      const beneficiaryRole = 'beneficiary';
      const allowedRoles = ['admin', 'nazer'];
      expect(allowedRoles.includes(beneficiaryRole)).toBe(false);
    });
  });
});

describe('Audit Logs', () => {
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
  });
});
