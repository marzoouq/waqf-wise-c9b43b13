/**
 * Shared Hooks Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Shared Hooks', () => {
  it('should import useDeleteConfirmation', async () => {
    const { useDeleteConfirmation } = await import('@/hooks/shared');
    expect(useDeleteConfirmation).toBeDefined();
    expect(typeof useDeleteConfirmation).toBe('function');
  });

  it('should import useDialog', async () => {
    const { useDialog } = await import('@/hooks/shared');
    expect(useDialog).toBeDefined();
    expect(typeof useDialog).toBe('function');
  });

  it('should import useMultipleDialogs', async () => {
    const { useMultipleDialogs } = await import('@/hooks/shared');
    expect(useMultipleDialogs).toBeDefined();
    expect(typeof useMultipleDialogs).toBe('function');
  });
});
