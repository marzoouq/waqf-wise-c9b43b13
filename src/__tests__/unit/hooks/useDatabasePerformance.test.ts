/**
 * اختبارات useDatabasePerformance Hook
 * @description فحص وظائف مراقبة أداء قاعدة البيانات
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock the database performance service
vi.mock('@/services/monitoring/db-performance.service', () => ({
  dbPerformanceService: {
    getPerformanceStats: vi.fn(),
    analyzeAlerts: vi.fn(),
    getSequentialScansStats: vi.fn(),
    getCacheHitRatio: vi.fn(),
  },
}));

import { useDatabasePerformance, useSequentialScansOnly, useCacheHitRatio } from '@/hooks/monitoring/useDatabasePerformance';
import { dbPerformanceService, type DBPerformanceStats, type PerformanceAlert } from '@/services/monitoring/db-performance.service';

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

const createMockStats = (overrides = {}): DBPerformanceStats => ({
  sequentialScans: [
    { table_name: 'users', seq_scan: 100, idx_scan: 500, seq_pct: 16.67, dead_rows: 10, live_rows: 1000 },
  ],
  cacheHitRatio: 99.5,
  connections: [
    { state: 'active', count: 5, max_idle_seconds: 0 },
    { state: 'idle', count: 10, max_idle_seconds: 3600 },
  ],
  totalDeadRows: 15,
  dbSizeMb: 256,
  timestamp: new Date().toISOString(),
  ...overrides,
});

const createMockAlert = (overrides = {}): PerformanceAlert => ({
  id: 'test-alert',
  type: 'warning',
  message: 'Test message',
  value: 50,
  threshold: 90,
  ...overrides,
});

describe('useDatabasePerformance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('جلب إحصائيات الأداء', () => {
    it('يجلب إحصائيات الأداء بنجاح', async () => {
      const mockStats = createMockStats();

      vi.mocked(dbPerformanceService.getPerformanceStats).mockResolvedValue(mockStats);
      vi.mocked(dbPerformanceService.analyzeAlerts).mockReturnValue([]);

      const { result } = renderHook(() => useDatabasePerformance(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stats).toEqual(mockStats);
      expect(dbPerformanceService.getPerformanceStats).toHaveBeenCalled();
    });

    it('يتعامل مع الأخطاء بشكل صحيح', async () => {
      vi.mocked(dbPerformanceService.getPerformanceStats).mockRejectedValue(new Error('Service unavailable'));

      const { result } = renderHook(() => useDatabasePerformance(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('تحليل Sequential Scans', () => {
    it('يرتب الجداول حسب عدد Sequential Scans', async () => {
      const mockStats = createMockStats({
        sequentialScans: [
          { table_name: 'small_table', seq_scan: 10, idx_scan: 100, seq_pct: 9.1, dead_rows: 0, live_rows: 50 },
          { table_name: 'big_table', seq_scan: 1000, idx_scan: 500, seq_pct: 66.67, dead_rows: 100, live_rows: 5000 },
          { table_name: 'medium_table', seq_scan: 100, idx_scan: 200, seq_pct: 33.33, dead_rows: 10, live_rows: 500 },
        ],
      });

      vi.mocked(dbPerformanceService.getPerformanceStats).mockResolvedValue(mockStats);
      vi.mocked(dbPerformanceService.analyzeAlerts).mockReturnValue([]);

      const { result } = renderHook(() => useDatabasePerformance(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.topSequentialScans[0].table_name).toBe('big_table');
      expect(result.current.topSequentialScans[1].table_name).toBe('medium_table');
      expect(result.current.topSequentialScans[2].table_name).toBe('small_table');
    });

    it('يستبعد الجداول بدون Sequential Scans', async () => {
      const mockStats = createMockStats({
        sequentialScans: [
          { table_name: 'indexed_table', seq_scan: 0, idx_scan: 1000, seq_pct: 0, dead_rows: 0, live_rows: 500 },
          { table_name: 'normal_table', seq_scan: 50, idx_scan: 100, seq_pct: 33.33, dead_rows: 5, live_rows: 200 },
        ],
      });

      vi.mocked(dbPerformanceService.getPerformanceStats).mockResolvedValue(mockStats);
      vi.mocked(dbPerformanceService.analyzeAlerts).mockReturnValue([]);

      const { result } = renderHook(() => useDatabasePerformance(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.topSequentialScans).toHaveLength(1);
      expect(result.current.topSequentialScans[0].table_name).toBe('normal_table');
    });
  });

  describe('ملخص الاتصالات', () => {
    it('يحسب ملخص الاتصالات بشكل صحيح', async () => {
      const mockStats = createMockStats({
        connections: [
          { state: 'active', count: 8, max_idle_seconds: 0 },
          { state: 'idle', count: 12, max_idle_seconds: 7200 },
        ],
      });

      vi.mocked(dbPerformanceService.getPerformanceStats).mockResolvedValue(mockStats);
      vi.mocked(dbPerformanceService.analyzeAlerts).mockReturnValue([]);

      const { result } = renderHook(() => useDatabasePerformance(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.connectionsSummary.active).toBe(8);
      expect(result.current.connectionsSummary.idle).toBe(12);
      expect(result.current.connectionsSummary.total).toBe(20);
    });

    it('يعيد قيم صفرية عند عدم وجود بيانات', async () => {
      const mockStats = createMockStats({ connections: [] });

      vi.mocked(dbPerformanceService.getPerformanceStats).mockResolvedValue(mockStats);
      vi.mocked(dbPerformanceService.analyzeAlerts).mockReturnValue([]);

      const { result } = renderHook(() => useDatabasePerformance(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.connectionsSummary.active).toBe(0);
      expect(result.current.connectionsSummary.idle).toBe(0);
      expect(result.current.connectionsSummary.total).toBe(0);
    });
  });

  describe('تصنيف التنبيهات', () => {
    it('يصنف التنبيهات الحرجة والتحذيرية', async () => {
      const mockStats = createMockStats();

      const mockAlerts: PerformanceAlert[] = [
        createMockAlert({ id: '1', type: 'critical', message: 'Low cache hit', value: 75, threshold: 90 }),
        createMockAlert({ id: '2', type: 'critical', message: 'High dead rows', value: 100000, threshold: 50000 }),
        createMockAlert({ id: '3', type: 'warning', message: 'High seq scan', value: 95, threshold: 90, table: 'logs' }),
      ];

      vi.mocked(dbPerformanceService.getPerformanceStats).mockResolvedValue(mockStats);
      vi.mocked(dbPerformanceService.analyzeAlerts).mockReturnValue(mockAlerts);

      const { result } = renderHook(() => useDatabasePerformance(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.criticalAlerts).toHaveLength(2);
      expect(result.current.warningAlerts).toHaveLength(1);
      expect(result.current.hasAlerts).toBe(true);
      expect(result.current.hasCriticalAlerts).toBe(true);
    });
  });
});

describe('useSequentialScansOnly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يجلب إحصائيات Sequential Scans فقط', async () => {
    const mockScans = [
      { table_name: 'users', seq_scan: 100, idx_scan: 500, seq_pct: 16.67, dead_rows: 10, live_rows: 1000 },
    ];

    vi.mocked(dbPerformanceService.getSequentialScansStats).mockResolvedValue(mockScans);

    const { result } = renderHook(() => useSequentialScansOnly(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockScans);
  });
});

describe('useCacheHitRatio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يجلب نسبة Cache Hit', async () => {
    vi.mocked(dbPerformanceService.getCacheHitRatio).mockResolvedValue(99.5);

    const { result } = renderHook(() => useCacheHitRatio(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe(99.5);
  });
});
