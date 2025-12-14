/**
 * أدوات الاختبار المشتركة
 * Test Utilities
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { vi } from 'vitest';

// Re-export mock utilities from setup
export { setMockTableData, clearMockTableData } from '../../test/setup';

// إنشاء QueryClient للاختبارات
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Wrapper لجميع الـ Providers
interface AllProvidersProps {
  children: React.ReactNode;
}

const AllProviders: React.FC<AllProvidersProps> = ({ children }) => {
  const testQueryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

/**
 * Creates a wrapper function for testing hooks with renderHook
 * Returns a fresh QueryClient for each test
 */
export const createWrapper = () => {
  const testQueryClient = createTestQueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

/**
 * Helper to create a mock authenticated user
 */
export const mockAuthenticatedUser = (overrides: Record<string, unknown> = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  ...overrides,
});

/**
 * Helper to create a mock profile
 */
export const mockProfile = (overrides: Record<string, unknown> = {}) => ({
  id: 'test-user-id',
  full_name: 'Test User',
  email: 'test@example.com',
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// دالة render مخصصة
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// تصدير كل شيء من testing-library
export * from '@testing-library/react';
export { customRender as render };

// انتظار تحميل البيانات
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// إنشاء mock للـ IntersectionObserver
export const mockIntersectionObserver = () => {
  const mockObserver = vi.fn();
  mockObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockObserver;
};

// إنشاء mock للـ ResizeObserver
export const mockResizeObserver = () => {
  const mockObserver = vi.fn();
  mockObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockObserver;
};

// إنشاء mock للـ matchMedia
export const mockMatchMedia = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};
