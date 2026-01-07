/**
 * Search Hooks Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Search Hooks', () => {
  it('should import useGlobalSearchData', async () => {
    const { useGlobalSearchData } = await import('@/hooks/search');
    expect(useGlobalSearchData).toBeDefined();
    expect(typeof useGlobalSearchData).toBe('function');
  });

  it('should import useRecentSearches', async () => {
    const { useRecentSearches } = await import('@/hooks/search');
    expect(useRecentSearches).toBeDefined();
    expect(typeof useRecentSearches).toBe('function');
  });
});
