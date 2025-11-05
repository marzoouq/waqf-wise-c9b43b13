import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach } from 'vitest';
import { useFolders } from '../useFolders';

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

describe('useFolders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch folders successfully', async () => {
    const { result } = renderHook(() => useFolders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.folders).toBeDefined();
    expect(Array.isArray(result.current.folders)).toBe(true);
  });

  it('should have addFolder function', async () => {
    const { result } = renderHook(() => useFolders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.addFolder).toBeDefined();
    });

    expect(typeof result.current.addFolder).toBe('function');
  });

  it('should have updateFolder function', async () => {
    const { result } = renderHook(() => useFolders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.updateFolder).toBeDefined();
    });

    expect(typeof result.current.updateFolder).toBe('function');
  });
});
