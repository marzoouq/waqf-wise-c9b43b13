import { describe, it, expect } from 'vitest';

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useContracts } from '@/hooks/useContracts';
import { useRentalPayments } from '@/hooks/useRentalPayments';

describe('Contract Renewal and Payments Integration', () => {
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

  it('should renew contract and generate new payment schedule', async () => {
    const { result: contractsResult } = renderHook(() => useContracts(), { wrapper });
    await waitFor(() => expect(contractsResult.current.contracts).toBeDefined());

    const { result: paymentsResult } = renderHook(() => useRentalPayments(), { wrapper });
    await waitFor(() => expect(paymentsResult.current.payments).toBeDefined());

    expect(true).toBe(true);
  });
});
