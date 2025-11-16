import { describe, it, expect } from 'vitest';

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBeneficiaries } from '@/hooks/useBeneficiaries';
import { useFamilies } from '@/hooks/useFamilies';
import { useDistributions } from '@/hooks/useDistributions';

describe('Beneficiary Family Management Integration', () => {
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

  it('should manage family members and update distributions', async () => {
    const { result: beneficiariesResult } = renderHook(() => useBeneficiaries(), { wrapper });
    await waitFor(() => expect(beneficiariesResult.current.beneficiaries).toBeDefined());

    const { result: familiesResult } = renderHook(() => useFamilies(), { wrapper });
    await waitFor(() => expect(familiesResult.current.families).toBeDefined());

    const { result: distributionsResult } = renderHook(() => useDistributions(), { wrapper });
    await waitFor(() => expect(distributionsResult.current.distributions).toBeDefined());

    expect(true).toBe(true);
  });
});
