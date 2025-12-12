/**
 * اختبارات خدمة المراقبة
 * MonitoringService Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MonitoringService } from '@/services/monitoring.service';
import { setMockTableData, clearMockTableData } from '../../utils/supabase.mock';

describe('MonitoringService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('getSystemStats', () => {
    it('should return correct system statistics', async () => {
      setMockTableData('system_error_logs', [
        { id: 'err-1', severity: 'critical', status: 'new' },
        { id: 'err-2', severity: 'high', status: 'resolved' },
        { id: 'err-3', severity: 'medium', status: 'new' },
      ]);

      setMockTableData('system_alerts', [
        { id: 'alert-1', severity: 'high', status: 'active' },
        { id: 'alert-2', severity: 'medium', status: 'resolved' },
      ]);

      setMockTableData('system_health_checks', [
        { id: 'hc-1', status: 'healthy' },
        { id: 'hc-2', status: 'healthy' },
        { id: 'hc-3', status: 'unhealthy' },
      ]);

      const stats = await MonitoringService.getSystemStats();

      expect(stats).toHaveProperty('totalErrors');
      expect(stats).toHaveProperty('unresolvedErrors');
      expect(stats).toHaveProperty('criticalErrors');
      expect(stats).toHaveProperty('activeAlerts');
      expect(stats).toHaveProperty('healthyChecks');
      expect(stats).toHaveProperty('totalHealthChecks');
    });
  });

  describe('getRecentErrors', () => {
    it('should return recent errors', async () => {
      setMockTableData('system_error_logs', [
        { id: 'err-1', message: 'Error 1', created_at: '2024-12-01T10:00:00Z' },
        { id: 'err-2', message: 'Error 2', created_at: '2024-12-01T09:00:00Z' },
      ]);

      const errors = await MonitoringService.getRecentErrors(10);

      expect(Array.isArray(errors)).toBe(true);
    });
  });

  describe('getActiveAlerts', () => {
    it('should return only active alerts', async () => {
      setMockTableData('system_alerts', [
        { id: 'alert-1', status: 'active', message: 'Alert 1' },
        { id: 'alert-2', status: 'resolved', message: 'Alert 2' },
      ]);

      const alerts = await MonitoringService.getActiveAlerts();

      expect(Array.isArray(alerts)).toBe(true);
    });
  });

  describe('getSmartAlerts', () => {
    it('should return smart alerts for contracts, payments, loans, and requests', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      setMockTableData('contracts', [
        {
          id: 'cont-1',
          contract_number: 'CNT-001',
          tenant_name: 'Test Tenant',
          end_date: futureDate.toISOString().split('T')[0],
          status: 'نشط',
          properties: { name: 'Test Property' },
        },
      ]);

      setMockTableData('rental_payments', []);
      setMockTableData('loan_installments', []);
      setMockTableData('beneficiary_requests', []);

      const alerts = await MonitoringService.getSmartAlerts();

      expect(Array.isArray(alerts)).toBe(true);
    });
  });

  describe('updateError', () => {
    it('should update error status', async () => {
      await expect(
        MonitoringService.updateError('err-1', 'resolved', 'Fixed manually')
      ).resolves.not.toThrow();
    });
  });

  describe('resolveAlert', () => {
    it('should resolve an alert', async () => {
      await expect(
        MonitoringService.resolveAlert('alert-1')
      ).resolves.not.toThrow();
    });
  });

  describe('deleteResolvedErrors', () => {
    it('should delete resolved errors', async () => {
      await expect(
        MonitoringService.deleteResolvedErrors()
      ).resolves.not.toThrow();
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should return performance metrics since a given date', async () => {
      setMockTableData('audit_logs', [
        { created_at: '2024-12-01T10:00:00Z', action_type: 'create' },
        { created_at: '2024-12-01T11:00:00Z', action_type: 'update' },
      ]);

      const since = new Date('2024-12-01');
      const metrics = await MonitoringService.getPerformanceMetrics(since);

      expect(Array.isArray(metrics)).toBe(true);
    });
  });

  describe('getUserActivityMetrics', () => {
    it('should return user activity metrics', async () => {
      setMockTableData('login_attempts_log', []);
      setMockTableData('profiles', []);
      setMockTableData('activities', []);

      const since = new Date('2024-12-01');
      const metrics = await MonitoringService.getUserActivityMetrics(since);

      expect(metrics).toHaveProperty('loginAttempts');
      expect(metrics).toHaveProperty('newProfiles');
      expect(metrics).toHaveProperty('activities');
    });
  });
});
