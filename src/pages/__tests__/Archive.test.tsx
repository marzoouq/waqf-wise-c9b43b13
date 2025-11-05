import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Archive from '../Archive';

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

describe('Archive Page', () => {
  it('renders archive page title', async () => {
    const { getByText } = render(<Archive />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(getByText('الأرشيف الإلكتروني')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    const { getByText } = render(<Archive />, { wrapper: createWrapper() });
    expect(getByText(/جاري تحميل/i)).toBeInTheDocument();
  });

  it('renders upload document button', async () => {
    const { getByText } = render(<Archive />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(getByText('رفع مستند')).toBeInTheDocument();
    });
  });

  it('renders create folder button', async () => {
    const { getByText } = render(<Archive />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(getByText('مجلد جديد')).toBeInTheDocument();
    });
  });
});
