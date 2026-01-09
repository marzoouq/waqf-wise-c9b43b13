/**
 * اختبارات Hooks المشتركة - اختبارات حقيقية
 * Shared Hooks Tests - Real Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({ 
    defaultOptions: { queries: { retry: false } } 
  });
  return ({ children }: { children: React.ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('Shared Hooks - Real Tests', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('useDeleteConfirmation', () => {
    it('should initialize with isOpen = false', async () => {
      const { useDeleteConfirmation } = await import('@/hooks/shared');
      const onDelete = vi.fn();
      
      const { result } = renderHook(
        () => useDeleteConfirmation({ onDelete }), 
        { wrapper: createWrapper() }
      );

      expect(result.current.isOpen).toBe(false);
    });

    it('should have required functions', async () => {
      const { useDeleteConfirmation } = await import('@/hooks/shared');
      const onDelete = vi.fn();
      
      const { result } = renderHook(
        () => useDeleteConfirmation({ onDelete }), 
        { wrapper: createWrapper() }
      );

      // التحقق من وجود الدوال الأساسية
      expect(typeof result.current.isOpen).toBe('boolean');
      expect(result.current).toBeDefined();
    });
  });

  describe('useDialog', () => {
    it('should initialize with provided initial state', async () => {
      const { useDialog } = await import('@/hooks/shared');
      
      const { result: closedResult } = renderHook(
        () => useDialog(false), 
        { wrapper: createWrapper() }
      );
      expect(closedResult.current.isOpen).toBe(false);

      const { result: openResult } = renderHook(
        () => useDialog(true), 
        { wrapper: createWrapper() }
      );
      expect(openResult.current.isOpen).toBe(true);
    });

    it('should have open, close, and toggle functions', async () => {
      const { useDialog } = await import('@/hooks/shared');
      
      const { result } = renderHook(
        () => useDialog(false), 
        { wrapper: createWrapper() }
      );

      expect(typeof result.current.open).toBe('function');
      expect(typeof result.current.close).toBe('function');
      expect(typeof result.current.toggle).toBe('function');
    });

    it('should open dialog when open() is called', async () => {
      const { useDialog } = await import('@/hooks/shared');
      
      const { result } = renderHook(
        () => useDialog(false), 
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('should close dialog when close() is called', async () => {
      const { useDialog } = await import('@/hooks/shared');
      
      const { result } = renderHook(
        () => useDialog(true), 
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('should toggle dialog state', async () => {
      const { useDialog } = await import('@/hooks/shared');
      
      const { result } = renderHook(
        () => useDialog(false), 
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('useMultipleDialogs', () => {
    it('should initialize and provide required functions', async () => {
      const { useMultipleDialogs } = await import('@/hooks/shared');
      
      const { result } = renderHook(
        () => useMultipleDialogs(['create', 'edit']), 
        { wrapper: createWrapper() }
      );

      // التحقق من وجود الدوال الأساسية
      expect(result.current).toBeDefined();
      expect(typeof result.current.open).toBe('function');
      expect(typeof result.current.close).toBe('function');
      expect(typeof result.current.closeAll).toBe('function');
      expect(typeof result.current.isOpen).toBe('function');
    });

    it('should track dialog states correctly', async () => {
      const { useMultipleDialogs } = await import('@/hooks/shared');
      
      const { result } = renderHook(
        () => useMultipleDialogs(['create', 'edit']), 
        { wrapper: createWrapper() }
      );

      // الحالة الأولية - كل الحوارات مغلقة
      expect(result.current.isOpen('create')).toBe(false);
      expect(result.current.isOpen('edit')).toBe(false);

      // فتح حوار
      act(() => {
        result.current.open('create');
      });

      expect(result.current.isOpen('create')).toBe(true);
      expect(result.current.isOpen('edit')).toBe(false);

      // إغلاق الحوار
      act(() => {
        result.current.close('create');
      });

      expect(result.current.isOpen('create')).toBe(false);
    });

    it('should close all dialogs', async () => {
      const { useMultipleDialogs } = await import('@/hooks/shared');
      
      const { result } = renderHook(
        () => useMultipleDialogs(['a', 'b']), 
        { wrapper: createWrapper() }
      );

      // فتح الحوارات
      act(() => {
        result.current.open('a');
        result.current.open('b');
      });

      expect(result.current.isOpen('a')).toBe(true);
      expect(result.current.isOpen('b')).toBe(true);

      // إغلاق الكل
      act(() => {
        result.current.closeAll();
      });

      expect(result.current.isOpen('a')).toBe(false);
      expect(result.current.isOpen('b')).toBe(false);
    });
  });
});
