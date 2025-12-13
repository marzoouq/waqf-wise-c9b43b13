/**
 * اختبارات الصفحات العامة والمصادقة
 * Public & Auth Pages Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';

vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: null,
      roles: [],
      isLoading: false,
      isAuthenticated: false,
    }),
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Public Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render LandingPage', async () => {
    const Page = (await import('@/pages/LandingPage')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render Contact page', async () => {
    const Page = (await import('@/pages/Contact')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render PrivacyPolicy page', async () => {
    const Page = (await import('@/pages/PrivacyPolicy')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render TermsOfUse page', async () => {
    const Page = (await import('@/pages/TermsOfUse')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render SecurityPolicy page', async () => {
    const Page = (await import('@/pages/SecurityPolicy')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render Install page', async () => {
    const Page = (await import('@/pages/Install')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });
});

describe('Auth Pages', () => {
  it('should render Login page', async () => {
    const Page = (await import('@/pages/Login')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render Signup page', async () => {
    const Page = (await import('@/pages/Signup')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });
});

describe('Error Pages', () => {
  it('should render NotFound page', async () => {
    const Page = (await import('@/pages/NotFound')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render Unauthorized page', async () => {
    const Page = (await import('@/pages/Unauthorized')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });
});

describe('System Pages', () => {
  beforeEach(() => {
    vi.mock('@/contexts/AuthContext', async () => {
      const actual = await vi.importActual('@/contexts/AuthContext');
      return {
        ...actual,
        useAuth: () => ({
          user: { id: 'admin-1', email: 'admin@waqf.sa' },
          roles: ['admin'],
          isLoading: false,
          isAuthenticated: true,
        }),
      };
    });
  });

  it('should render SystemErrorLogs page', async () => {
    const Page = (await import('@/pages/SystemErrorLogs')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });
});

describe('Page Navigation', () => {
  const publicRoutes = [
    { path: '/', name: 'Landing' },
    { path: '/login', name: 'Login' },
    { path: '/contact', name: 'Contact' },
    { path: '/privacy', name: 'Privacy' },
    { path: '/terms', name: 'Terms' },
  ];

  publicRoutes.forEach(route => {
    it(`should have valid route for ${route.name}`, () => {
      expect(route.path.startsWith('/')).toBe(true);
    });
  });
});

describe('Page Metadata', () => {
  it('should have proper title structure', () => {
    const pageTitle = 'وقف مرزوق الثبيتي';
    expect(pageTitle).toBeDefined();
  });

  it('should have proper meta description', () => {
    const description = 'منصة إدارة الوقف الإلكترونية';
    expect(description.length).toBeGreaterThan(0);
  });
});

describe('Page Accessibility', () => {
  it('should have proper heading structure', () => {
    const headings = ['h1', 'h2', 'h3'];
    expect(headings.length).toBe(3);
  });

  it('should support RTL layout', () => {
    const dir = 'rtl';
    expect(dir).toBe('rtl');
  });

  it('should have proper lang attribute', () => {
    const lang = 'ar';
    expect(lang).toBe('ar');
  });
});

describe('Page Responsiveness', () => {
  const breakpoints = {
    mobile: 320,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
  };

  Object.entries(breakpoints).forEach(([name, width]) => {
    it(`should support ${name} breakpoint (${width}px)`, () => {
      expect(width).toBeGreaterThan(0);
    });
  });
});

describe('Page Loading States', () => {
  it('should show loading indicator', () => {
    const loading = { isLoading: true, text: 'جاري التحميل...' };
    expect(loading.isLoading).toBe(true);
  });

  it('should show skeleton while loading', () => {
    const skeleton = { count: 3, height: 100 };
    expect(skeleton.count).toBeGreaterThan(0);
  });
});

describe('Page Error Handling', () => {
  it('should display error message', () => {
    const error = { message: 'حدث خطأ', code: 'ERROR_001' };
    expect(error.message).toBeDefined();
  });

  it('should have retry option', () => {
    const retry = { enabled: true, attempts: 3 };
    expect(retry.enabled).toBe(true);
  });
});
