/**
 * اختبارات hook العقارات
 * useProperties Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProperties } from '@/hooks/property/useProperties';
import { createTestQueryClient } from '../../utils/test-utils';
import { setMockTableData, clearMockTableData } from '../../utils/supabase.mock';
import { mockProperties } from '../../utils/data.fixtures';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('useProperties', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('fetching properties', () => {
    it('should fetch properties list', () => {
      setMockTableData('properties', mockProperties);

      const { result } = renderHook(() => useProperties(), {
        wrapper: createWrapper(),
      });

      expect(result.current.properties).toBeDefined();
    });

    it('should return loading state initially', () => {
      setMockTableData('properties', []);

      const { result } = renderHook(() => useProperties(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBeDefined();
    });
  });

  describe('data structure', () => {
    it('should return properties array', () => {
      setMockTableData('properties', mockProperties);

      const { result } = renderHook(() => useProperties(), {
        wrapper: createWrapper(),
      });

      expect(Array.isArray(result.current.properties)).toBe(true);
    });
  });

  describe('mutations', () => {
    it('should have addProperty mutation', () => {
      const { result } = renderHook(() => useProperties(), {
        wrapper: createWrapper(),
      });

      expect(result.current.addProperty).toBeDefined();
    });

    it('should have updateProperty mutation', () => {
      const { result } = renderHook(() => useProperties(), {
        wrapper: createWrapper(),
      });

      expect(result.current.updateProperty).toBeDefined();
    });

    it('should have deleteProperty mutation', () => {
      const { result } = renderHook(() => useProperties(), {
        wrapper: createWrapper(),
      });

      expect(result.current.deleteProperty).toBeDefined();
    });
  });
});
