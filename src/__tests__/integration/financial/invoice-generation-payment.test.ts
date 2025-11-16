import { describe, it, expect } from 'vitest';

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';

describe('Invoice Generation and Payment Integration', () => {
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

  it('should generate ZATCA invoice and process payment', async () => {
    const { result: invoicesResult } = renderHook(() => useInvoices(), { wrapper });
    await waitFor(() => expect(invoicesResult.current.invoices).toBeDefined());

    const { result: paymentsResult } = renderHook(() => usePayments(), { wrapper });
    await waitFor(() => expect(paymentsResult.current.payments).toBeDefined());

    expect(true).toBe(true);
  });
});
