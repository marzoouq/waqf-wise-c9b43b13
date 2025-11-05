import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Dashboard from '../Dashboard';

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

describe('Dashboard Page', () => {
  it('renders dashboard title', async () => {
    const { getByText } = render(<Dashboard />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(getByText('لوحة التحكم')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    const { getByText } = render(<Dashboard />, { wrapper: createWrapper() });
    expect(getByText(/جاري تحميل/i)).toBeInTheDocument();
  });

  it('renders activities section', async () => {
    const { getByText } = render(<Dashboard />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(getByText('آخر الأنشطة')).toBeInTheDocument();
    });
  });

  it('renders tasks section', async () => {
    const { getByText } = render(<Dashboard />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(getByText('المهام المعلقة')).toBeInTheDocument();
    });
  });
});
