/**
 * اختبارات hook الإشعارات
 * Notifications Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { useNotifications } from '@/hooks/notifications/useNotifications';
import { clearMockTableData, setMockTableData } from '../../utils/supabase.mock';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );
  };
};

const mockNotifications = [
  {
    id: 'notif-1',
    title: 'إشعار اختباري',
    message: 'رسالة اختبارية',
    type: 'info',
    is_read: false,
    created_at: '2024-01-01T00:00:00Z',
  },
];

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('fetching notifications', () => {
    it('should return notifications array', () => {
      setMockTableData('notifications', mockNotifications);

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      expect(result.current.notifications).toBeDefined();
      expect(Array.isArray(result.current.notifications)).toBe(true);
    });

    it('should have loading state initially', () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBeDefined();
    });
  });

  describe('mutations', () => {
    it('should have markAsRead function', () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      expect(result.current.markAsRead).toBeDefined();
      expect(typeof result.current.markAsRead).toBe('function');
    });

    it('should have markAllAsRead function', () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      expect(result.current.markAllAsRead).toBeDefined();
      expect(typeof result.current.markAllAsRead).toBe('function');
    });
  });

  describe('unread count', () => {
    it('should return unread count', () => {
      setMockTableData('notifications', mockNotifications);

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      expect(result.current.unreadCount).toBeDefined();
      expect(typeof result.current.unreadCount).toBe('number');
    });
  });
});
