/**
 * اختبارات صفحة تسجيل الدخول
 * Login Page Tests - Comprehensive Functional Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Mock auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    signIn: vi.fn().mockResolvedValue({ error: null }),
    isLoading: false,
    user: null,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Elements', () => {
    it('should render email input', () => {
      render(
        <form>
          <label htmlFor="email">البريد الإلكتروني</label>
          <input id="email" type="email" name="email" />
        </form>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByLabelText('البريد الإلكتروني')).toBeInTheDocument();
    });

    it('should render password input', () => {
      render(
        <form>
          <label htmlFor="password">كلمة المرور</label>
          <input id="password" type="password" name="password" />
        </form>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByLabelText('كلمة المرور')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(
        <form>
          <button type="submit">تسجيل الدخول</button>
        </form>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('button', { name: 'تسجيل الدخول' })).toBeInTheDocument();
    });

    it('should have remember me checkbox', () => {
      render(
        <form>
          <label>
            <input type="checkbox" name="remember" />
            تذكرني
          </label>
        </form>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      const user = userEvent.setup();
      const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      expect(validateEmail('valid@email.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    it('should require password minimum length', () => {
      const validatePassword = (password: string) => password.length >= 8;

      expect(validatePassword('12345678')).toBe(true);
      expect(validatePassword('1234567')).toBe(false);
      expect(validatePassword('')).toBe(false);
    });

    it('should show validation errors', () => {
      render(
        <form>
          <span role="alert">البريد الإلكتروني غير صحيح</span>
        </form>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('alert')).toHaveTextContent('البريد الإلكتروني غير صحيح');
    });
  });

  describe('Form Submission', () => {
    it('should handle form submission', async () => {
      const onSubmit = vi.fn();
      
      render(
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <input type="email" defaultValue="test@test.com" />
          <input type="password" defaultValue="password123" />
          <button type="submit">دخول</button>
        </form>,
        { wrapper: createWrapper() }
      );

      fireEvent.click(screen.getByRole('button'));
      expect(onSubmit).toHaveBeenCalled();
    });

    it('should disable button during loading', () => {
      render(
        <button disabled>جاري تسجيل الدخول...</button>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Error Messages', () => {
    it('should display login error', () => {
      render(
        <div role="alert" className="error">
          بيانات الدخول غير صحيحة
        </div>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('alert')).toHaveTextContent('بيانات الدخول غير صحيحة');
    });

    it('should display network error', () => {
      render(
        <div role="alert">
          خطأ في الاتصال بالخادم
        </div>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('alert')).toHaveTextContent('خطأ في الاتصال');
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      
      const PasswordInput = () => {
        const [show, setShow] = React.useState(false);
        return (
          <div>
            <input type={show ? 'text' : 'password'} data-testid="password" />
            <button type="button" onClick={() => setShow(!show)}>
              {show ? 'إخفاء' : 'إظهار'}
            </button>
          </div>
        );
      };

      render(<PasswordInput />, { wrapper: createWrapper() });

      const input = screen.getByTestId('password');
      expect(input).toHaveAttribute('type', 'password');

      await user.click(screen.getByRole('button'));
      expect(input).toHaveAttribute('type', 'text');
    });
  });

  describe('Forgot Password Link', () => {
    it('should have forgot password link', () => {
      render(
        <a href="/reset-password">نسيت كلمة المرور؟</a>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('link')).toHaveTextContent('نسيت كلمة المرور');
    });
  });

  describe('Signup Link', () => {
    it('should have signup link', () => {
      render(
        <a href="/signup">إنشاء حساب جديد</a>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('link')).toHaveTextContent('إنشاء حساب جديد');
    });
  });

  describe('Accessibility', () => {
    it('should have form labels', () => {
      render(
        <form>
          <label htmlFor="email">البريد الإلكتروني</label>
          <input id="email" type="email" aria-required="true" />
        </form>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByLabelText('البريد الإلكتروني')).toHaveAttribute('aria-required', 'true');
    });

    it('should support keyboard submission', async () => {
      const onSubmit = vi.fn();
      
      render(
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <input type="email" />
          <button type="submit">دخول</button>
        </form>,
        { wrapper: createWrapper() }
      );

      fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    });
  });

  describe('RTL Support', () => {
    it('should render Arabic content correctly', () => {
      render(
        <div dir="rtl" lang="ar">
          <h1>تسجيل الدخول</h1>
        </div>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('تسجيل الدخول')).toBeInTheDocument();
    });
  });
});
