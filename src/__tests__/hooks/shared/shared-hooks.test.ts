/**
 * اختبارات Hooks المشتركة - مبسطة
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: qc }, children);
};

describe('Shared Hooks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('useDeleteConfirmation returns confirmation state', async () => {
    const { useDeleteConfirmation } = await import('@/hooks/shared');
    const onDelete = vi.fn();
    const { result } = renderHook(() => useDeleteConfirmation({ onDelete }), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('isOpen');
    expect(result.current.isOpen).toBe(false);
  });

  it('useDialog returns dialog state', async () => {
    const { useDialog } = await import('@/hooks/shared');
    const { result } = renderHook(() => useDialog(false), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('isOpen');
    expect(typeof result.current.open).toBe('function');
  });

  it('useMultipleDialogs manages multiple dialogs', async () => {
    const { useMultipleDialogs } = await import('@/hooks/shared');
    const { result } = renderHook(() => useMultipleDialogs(['create', 'edit']), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });
});
