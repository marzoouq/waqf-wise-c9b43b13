/**
 * اختبارات useDatabaseHealth Hook
 * @description فحص وظائف مراقبة صحة قاعدة البيانات
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock the database health service
vi.mock('@/services/monitoring/db-health.service', () => ({
  dbHealthService: {
    getHealthReport: vi.fn(),
    analyzeAlerts: vi.fn(),
    runVacuumAll: vi.fn(),
    runVacuumTable: vi.fn(),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { useDatabaseHealth } from '@/hooks/monitoring/useDatabaseHealth';
import { dbHealthService } from '@/services/monitoring/db-health.service';
import type { DatabaseHealthReport, HealthAlert } from '@/services/monitoring/db-health.service';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
  return Wrapper;
};

const createMockReport = (overrides = {}): DatabaseHealthReport => ({
  duplicateIndexes: [],
  duplicatePolicies: [],
  deadRowsInfo: [],
  queryErrors: [],
  timestamp: new Date().toISOString(),
  summary: {
    total_tables: 100,
    total_indexes: 200,
    duplicate_indexes: 0,
    duplicate_policies: 0,
    tables_with_dead_rows: 0,
    total_dead_rows: 0,
    db_size_mb: 100,
    cache_hit_ratio: 99.5,
  },
  ...overrides,
});

const createMockAlert = (overrides = {}): HealthAlert => ({
  id: 'test-alert',
  type: 'warning',
  title: 'Test Alert',
  message: 'Test message',
  ...overrides,
});

describe('useDatabaseHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('جلب تقرير الصحة', () => {
    it('يجلب تقرير صحة قاعدة البيانات بنجاح', async () => {
      const mockReport = createMockReport();

      vi.mocked(dbHealthService.getHealthReport).mockResolvedValue(mockReport);
      vi.mocked(dbHealthService.analyzeAlerts).mockReturnValue([]);

      const { result } = renderHook(() => useDatabaseHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.report).toEqual(mockReport);
      expect(dbHealthService.getHealthReport).toHaveBeenCalled();
    });

    it('يتعامل مع الأخطاء بشكل صحيح', async () => {
      vi.mocked(dbHealthService.getHealthReport).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useDatabaseHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('حساب نقاط الصحة', () => {
    it('يحسب نقاط الصحة للتقرير المثالي', async () => {
      const mockReport = createMockReport({
        summary: {
          total_tables: 100,
          total_indexes: 200,
          duplicate_indexes: 0,
          duplicate_policies: 0,
          tables_with_dead_rows: 0,
          total_dead_rows: 0,
          db_size_mb: 100,
          cache_hit_ratio: 100,
        },
      });

      vi.mocked(dbHealthService.getHealthReport).mockResolvedValue(mockReport);
      vi.mocked(dbHealthService.analyzeAlerts).mockReturnValue([]);

      const { result } = renderHook(() => useDatabaseHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.healthScore).toBeGreaterThanOrEqual(90);
    });
  });

  describe('تحليل التنبيهات', () => {
    it('يصنف التنبيهات حسب الخطورة', async () => {
      const mockReport = createMockReport();

      const mockAlerts: HealthAlert[] = [
        createMockAlert({ id: '1', type: 'critical', title: 'Critical', message: 'Critical issue' }),
        createMockAlert({ id: '2', type: 'warning', title: 'Warning 1', message: 'Warning issue' }),
        createMockAlert({ id: '3', type: 'warning', title: 'Warning 2', message: 'Another warning' }),
      ];

      vi.mocked(dbHealthService.getHealthReport).mockResolvedValue(mockReport);
      vi.mocked(dbHealthService.analyzeAlerts).mockReturnValue(mockAlerts);

      const { result } = renderHook(() => useDatabaseHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.alerts).toHaveLength(3);
      expect(result.current.criticalAlerts).toHaveLength(1);
      expect(result.current.warningAlerts).toHaveLength(2);
      expect(result.current.hasAlerts).toBe(true);
      expect(result.current.hasCriticalAlerts).toBe(true);
    });
  });

  describe('عمليات VACUUM', () => {
    it('ينفذ VACUUM All بنجاح', async () => {
      const mockReport = createMockReport();

      vi.mocked(dbHealthService.getHealthReport).mockResolvedValue(mockReport);
      vi.mocked(dbHealthService.analyzeAlerts).mockReturnValue([]);
      vi.mocked(dbHealthService.runVacuumAll).mockResolvedValue(true);

      const { result } = renderHook(() => useDatabaseHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.runVacuumAll();

      expect(dbHealthService.runVacuumAll).toHaveBeenCalled();
    });

    it('ينفذ VACUUM على جدول محدد', async () => {
      const mockReport = createMockReport();

      vi.mocked(dbHealthService.getHealthReport).mockResolvedValue(mockReport);
      vi.mocked(dbHealthService.analyzeAlerts).mockReturnValue([]);
      vi.mocked(dbHealthService.runVacuumTable).mockResolvedValue(true);

      const { result } = renderHook(() => useDatabaseHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.runVacuumTable('beneficiaries');

      expect(dbHealthService.runVacuumTable).toHaveBeenCalledWith('beneficiaries');
    });
  });

  describe('تحديد حالة الصحة', () => {
    it('يحسب حالة الصحة بناءً على التقرير', async () => {
      const mockReport = createMockReport();

      vi.mocked(dbHealthService.getHealthReport).mockResolvedValue(mockReport);
      vi.mocked(dbHealthService.analyzeAlerts).mockReturnValue([]);

      const { result } = renderHook(() => useDatabaseHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.report).toBeTruthy();
      expect(['excellent', 'good', 'warning', 'critical']).toContain(result.current.healthStatus);
    });
  });
});
