import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Funds from '../Funds';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Funds Page', () => {
  it('renders funds page title', async () => {
    const { getByText } = render(<Funds />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(getByText('إدارة الصناديق')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    const { getByText } = render(<Funds />, { wrapper: createWrapper() });
    expect(getByText(/جاري تحميل/i)).toBeInTheDocument();
  });

  it('renders add fund button', async () => {
    const { getByText } = render(<Funds />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(getByText(/صندوق جديد/i)).toBeInTheDocument();
    });
  });
});
