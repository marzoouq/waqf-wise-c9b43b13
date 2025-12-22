/**
 * اختبارات useSystemHealth Hook
 * @description فحص وظائف مراقبة صحة النظام العامة
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock the system service
vi.mock('@/services/system.service', () => ({
  SystemService: {
    getSystemHealth: vi.fn(),
  },
}));

import { useSystemHealth } from '@/hooks/system/useSystemHealth';
import { SystemService, type SystemHealth } from '@/services/system.service';

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

const createMockHealth = (overrides = {}): SystemHealth => ({
  database: {
    status: 'healthy',
    responseTime: 50,
    connections: 10,
  },
  storage: {
    status: 'healthy',
    usedSpace: 1024 * 1024 * 100,
    totalSpace: 1024 * 1024 * 1024 * 10,
  },
  uptime: {
    days: 30,
    hours: 12,
    minutes: 45,
  },
  performance: {
    avgResponseTime: 45,
    requestsPerMinute: 100,
  },
  ...overrides,
});

describe('useSystemHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('جلب صحة النظام', () => {
    it('يجلب بيانات صحة النظام بنجاح', async () => {
      const mockHealth = createMockHealth();

      vi.mocked(SystemService.getSystemHealth).mockResolvedValue(mockHealth);

      const { result } = renderHook(() => useSystemHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockHealth);
      expect(SystemService.getSystemHealth).toHaveBeenCalled();
    });

    it('يتعامل مع أخطاء الشبكة', async () => {
      vi.mocked(SystemService.getSystemHealth).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useSystemHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('حالات قاعدة البيانات', () => {
    it('يكتشف حالة "healthy" بشكل صحيح', async () => {
      const mockHealth = createMockHealth({
        database: { status: 'healthy', responseTime: 30, connections: 5 },
      });

      vi.mocked(SystemService.getSystemHealth).mockResolvedValue(mockHealth);

      const { result } = renderHook(() => useSystemHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data?.database.status).toBe('healthy');
      });
    });

    it('يكتشف حالة "degraded" عند بطء الاستجابة', async () => {
      const mockHealth = createMockHealth({
        database: { status: 'degraded', responseTime: 150, connections: 5 },
      });

      vi.mocked(SystemService.getSystemHealth).mockResolvedValue(mockHealth);

      const { result } = renderHook(() => useSystemHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data?.database.status).toBe('degraded');
      });
    });

    it('يكتشف حالة "down" عند فشل الاتصال', async () => {
      const mockHealth = createMockHealth({
        database: { status: 'down', responseTime: 0, connections: 0 },
      });

      vi.mocked(SystemService.getSystemHealth).mockResolvedValue(mockHealth);

      const { result } = renderHook(() => useSystemHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data?.database.status).toBe('down');
      });
    });
  });

  describe('معلومات التخزين', () => {
    it('يحسب مساحة التخزين المستخدمة بشكل صحيح', async () => {
      const usedSpace = 1024 * 1024 * 500;
      const totalSpace = 1024 * 1024 * 1024 * 10;

      const mockHealth = createMockHealth({
        storage: { status: 'healthy', usedSpace, totalSpace },
      });

      vi.mocked(SystemService.getSystemHealth).mockResolvedValue(mockHealth);

      const { result } = renderHook(() => useSystemHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data?.storage.usedSpace).toBe(usedSpace);
        expect(result.current.data?.storage.totalSpace).toBe(totalSpace);
      });
    });
  });

  describe('وقت التشغيل', () => {
    it('يحسب وقت التشغيل بشكل صحيح', async () => {
      const mockHealth = createMockHealth({
        uptime: { days: 45, hours: 8, minutes: 30 },
      });

      vi.mocked(SystemService.getSystemHealth).mockResolvedValue(mockHealth);

      const { result } = renderHook(() => useSystemHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data?.uptime.days).toBe(45);
        expect(result.current.data?.uptime.hours).toBe(8);
        expect(result.current.data?.uptime.minutes).toBe(30);
      });
    });
  });

  describe('مقاييس الأداء', () => {
    it('يعيد متوسط وقت الاستجابة', async () => {
      const mockHealth = createMockHealth({
        performance: { avgResponseTime: 42, requestsPerMinute: 150 },
      });

      vi.mocked(SystemService.getSystemHealth).mockResolvedValue(mockHealth);

      const { result } = renderHook(() => useSystemHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data?.performance.avgResponseTime).toBe(42);
        expect(result.current.data?.performance.requestsPerMinute).toBe(150);
      });
    });
  });

  describe('إعادة الجلب', () => {
    it('يدعم إعادة جلب البيانات يدوياً', async () => {
      const mockHealth = createMockHealth();

      vi.mocked(SystemService.getSystemHealth).mockResolvedValue(mockHealth);

      const { result } = renderHook(() => useSystemHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.refetch();

      expect(SystemService.getSystemHealth).toHaveBeenCalledTimes(2);
    });
  });
});
