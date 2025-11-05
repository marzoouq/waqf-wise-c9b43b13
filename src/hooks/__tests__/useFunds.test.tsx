import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach } from 'vitest';
import { useFunds } from '../useFunds';

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

describe('useFunds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch funds successfully', async () => {
    const { result } = renderHook(() => useFunds(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.funds).toBeDefined();
    expect(Array.isArray(result.current.funds)).toBe(true);
  });

  it('should have addFund function', async () => {
    const { result } = renderHook(() => useFunds(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.addFund).toBeDefined();
    });

    expect(typeof result.current.addFund).toBe('function');
  });

  it('should have updateFund function', async () => {
    const { result } = renderHook(() => useFunds(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.updateFund).toBeDefined();
    });

    expect(typeof result.current.updateFund).toBe('function');
  });
});
