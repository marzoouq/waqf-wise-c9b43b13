import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach } from 'vitest';
import { useActivities } from '../useActivities';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useActivities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch activities successfully', async () => {
    const { result } = renderHook(() => useActivities(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.activities).toBeDefined();
    expect(Array.isArray(result.current.activities)).toBe(true);
  });

  it('should have addActivity function', async () => {
    const { result } = renderHook(() => useActivities(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.addActivity).toBeDefined();
    });

    expect(typeof result.current.addActivity).toBe('function');
  });
});
