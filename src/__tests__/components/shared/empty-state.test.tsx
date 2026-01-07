/**
 * EmptyState Component Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('EmptyState Component', () => {
  it('should import EmptyState component', async () => {
    const module = await import('@/components/shared/EmptyState');
    expect(module.EmptyState).toBeDefined();
  });

  it('should be a valid React component', async () => {
    const { EmptyState } = await import('@/components/shared/EmptyState');
    expect(typeof EmptyState).toBe('function');
  });
});
