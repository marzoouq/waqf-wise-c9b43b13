import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useErrorHandler } from '../useErrorHandler';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useErrorHandler Hook', () => {
  it('should handle error with message', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error('Test error');

    expect(() => result.current.handleError(error)).not.toThrow();
  });

  it('should handle error with context', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error('Test error');

    expect(() => result.current.handleError(error, 'Test Context')).not.toThrow();
  });

  it('should handle error without message', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = {};

    expect(() => result.current.handleError(error)).not.toThrow();
  });

  it('should log error to console', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error('Test error');

    result.current.handleError(error);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
