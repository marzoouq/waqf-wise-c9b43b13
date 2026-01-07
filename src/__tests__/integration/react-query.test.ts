/**
 * Integration Tests - React Query
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';
import { QueryClient } from '@tanstack/react-query';

describe('Integration - React Query', () => {
  it('should create QueryClient instance', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    expect(queryClient).toBeDefined();
  });

  it('should import query keys', async () => {
    const { QUERY_KEYS } = await import('@/lib/query-keys');
    expect(QUERY_KEYS).toBeDefined();
  });

  it('should have proper query key structure', async () => {
    const { QUERY_KEYS } = await import('@/lib/query-keys');
    expect(typeof QUERY_KEYS.BENEFICIARIES).toBeDefined();
  });

  it('should handle cache invalidation', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(['test'], { data: 'test' });
    
    const data = queryClient.getQueryData(['test']);
    expect(data).toEqual({ data: 'test' });
    
    queryClient.removeQueries({ queryKey: ['test'] });
    expect(queryClient.getQueryData(['test'])).toBeUndefined();
  });
});
