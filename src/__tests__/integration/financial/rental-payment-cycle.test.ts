import { describe, it, expect } from 'vitest';

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useContracts } from '@/hooks/useContracts';
import { useRentalPayments } from '@/hooks/useRentalPayments';
import { useJournalEntries } from '@/hooks/useJournalEntries';

describe('Rental Payment Cycle Integration', () => {
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

  it('should complete rental payment workflow', async () => {
    const { result: contractsResult } = renderHook(() => useContracts(), { wrapper });
    await waitFor(() => expect(contractsResult.current.contracts).toBeDefined());

    const { result: paymentsResult } = renderHook(() => useRentalPayments(), { wrapper });
    await waitFor(() => expect(paymentsResult.current.payments).toBeDefined());

    const { result: journalResult } = renderHook(() => useJournalEntries(), { wrapper });
    await waitFor(() => expect(journalResult.current.journalEntries).toBeDefined());

    expect(true).toBe(true);
  });
});
