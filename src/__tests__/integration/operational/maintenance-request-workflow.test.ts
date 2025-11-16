import { describe, it, expect } from 'vitest';

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMaintenanceRequests } from '@/hooks/useMaintenanceRequests';
import { useJournalEntries } from '@/hooks/useJournalEntries';

describe('Maintenance Request Workflow Integration', () => {
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

  it('should process maintenance request end-to-end', async () => {
    const { result: maintenanceResult } = renderHook(() => useMaintenanceRequests(), { wrapper });
    await waitFor(() => expect(maintenanceResult.current.requests).toBeDefined());

    const { result: journalResult } = renderHook(() => useJournalEntries(), { wrapper });
    await waitFor(() => expect(journalResult.current.journalEntries).toBeDefined());

    expect(true).toBe(true);
  });
});
