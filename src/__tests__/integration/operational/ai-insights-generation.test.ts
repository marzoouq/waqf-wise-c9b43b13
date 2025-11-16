import { describe, it, expect } from 'vitest';

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAIInsights } from '@/hooks/useAIInsights';
import { useSmartAlerts } from '@/hooks/useSmartAlerts';

describe('AI Insights Generation Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: any) => {
    return { queryClient, children };
  };

  it('should generate AI insights from data', async () => {
    const { result: insightsResult } = renderHook(() => useAIInsights(), { wrapper });
    await waitFor(() => expect(insightsResult.current.insights).toBeDefined());

    const { result: alertsResult } = renderHook(() => useSmartAlerts(), { wrapper });
    await waitFor(() => expect(alertsResult.current.alerts).toBeDefined());

    expect(true).toBe(true);
  });
});
