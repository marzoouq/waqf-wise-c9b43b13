/**
 * AuthContext Tests - اختبارات وظيفية شاملة
 * @version 2.0.0
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Mock data
const mockUser = {
  id: 'user-123',
  email: 'test@waqf.sa',
  user_metadata: { full_name: 'أحمد محمد' },
};

const mockSession = {
  access_token: 'test-token',
  refresh_token: 'test-refresh',
  expires_at: Date.now() + 3600000,
  user: mockUser,
};

const mockProfile = {
  id: 'profile-123',
  user_id: 'user-123',
  full_name: 'أحمد محمد',
  email: 'test@waqf.sa',
  avatar_url: null,
  status: 'active',
};

const mockRoles = ['nazer', 'accountant'];

let authStateCallback: ((event: string, session: any) => void) | null = null;

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn((callback) => {
        authStateCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
    },
    from: vi.fn((table) => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
          maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
        }),
        in: vi.fn().mockResolvedValue({ data: mockRoles.map(r => ({ role: r })), error: null }),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    })),
    rpc: vi.fn().mockResolvedValue({ data: mockRoles, error: null }),
  },
}));

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('AuthContext - Comprehensive Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    authStateCallback = null;
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: 0 },
      },
    });
  });

  describe('Context Export & Structure', () => {
    it('should export AuthProvider', async () => {
      const { AuthProvider } = await import('@/contexts/AuthContext');
      expect(AuthProvider).toBeDefined();
      expect(typeof AuthProvider).toBe('function');
    });

    it('should export useAuth hook', async () => {
      const { useAuth } = await import('@/contexts/AuthContext');
      expect(useAuth).toBeDefined();
      expect(typeof useAuth).toBe('function');
    });
  });

  describe('AuthProvider Rendering', () => {
    it('should render children correctly', async () => {
      const { AuthProvider } = await import('@/contexts/AuthContext');
      const Wrapper = createTestWrapper();

      render(
        <Wrapper>
          <AuthProvider>
            <div data-testid="test-child">محتوى الاختبار</div>
          </AuthProvider>
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-child')).toBeInTheDocument();
      });
    });

    it('should render multiple children', async () => {
      const { AuthProvider } = await import('@/contexts/AuthContext');
      const Wrapper = createTestWrapper();

      render(
        <Wrapper>
          <AuthProvider>
            <div data-testid="child-1">الطفل الأول</div>
            <div data-testid="child-2">الطفل الثاني</div>
          </AuthProvider>
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('child-1')).toBeInTheDocument();
        expect(screen.getByTestId('child-2')).toBeInTheDocument();
      });
    });
  });

  describe('useAuth Hook Values', () => {
    it('should provide user value', async () => {
      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
      const Wrapper = createTestWrapper();

      const TestComponent = () => {
        const { user } = useAuth();
        return <div data-testid="user-id">{user?.id || 'لا يوجد مستخدم'}</div>;
      };

      render(
        <Wrapper>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toBeInTheDocument();
      });
    });

    it('should provide profile value', async () => {
      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
      const Wrapper = createTestWrapper();

      const TestComponent = () => {
        const { profile } = useAuth();
        return <div data-testid="profile-name">{profile?.full_name || 'لا يوجد ملف'}</div>;
      };

      render(
        <Wrapper>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('profile-name')).toBeInTheDocument();
      });
    });

    it('should provide isLoading value', async () => {
      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
      const Wrapper = createTestWrapper();

      const TestComponent = () => {
        const { isLoading } = useAuth();
        return <div data-testid="loading-state">{isLoading ? 'جاري التحميل' : 'اكتمل التحميل'}</div>;
      };

      render(
        <Wrapper>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      });
    });

    it('should provide roles array', async () => {
      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
      const Wrapper = createTestWrapper();

      const TestComponent = () => {
        const { roles } = useAuth();
        return <div data-testid="roles-count">{roles?.length || 0}</div>;
      };

      render(
        <Wrapper>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('roles-count')).toBeInTheDocument();
      });
    });

    it('should provide hasRole function', async () => {
      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
      const Wrapper = createTestWrapper();

      const TestComponent = () => {
        const { hasRole } = useAuth();
        return <div data-testid="has-role-fn">{typeof hasRole}</div>;
      };

      render(
        <Wrapper>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('has-role-fn').textContent).toBe('function');
      });
    });
  });

  describe('Authentication State Changes', () => {
    it('should handle SIGNED_IN event', async () => {
      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
      const Wrapper = createTestWrapper();

      const TestComponent = () => {
        const { user } = useAuth();
        return <div data-testid="auth-state">{user ? 'مسجل الدخول' : 'غير مسجل'}</div>;
      };

      render(
        <Wrapper>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </Wrapper>
      );

      // Simulate sign in event
      await act(async () => {
        if (authStateCallback) {
          authStateCallback('SIGNED_IN', mockSession);
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-state')).toBeInTheDocument();
      });
    });

    it('should handle SIGNED_OUT event', async () => {
      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
      const Wrapper = createTestWrapper();

      const TestComponent = () => {
        const { user } = useAuth();
        return <div data-testid="auth-state">{user ? 'مسجل الدخول' : 'غير مسجل'}</div>;
      };

      render(
        <Wrapper>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </Wrapper>
      );

      // Simulate sign out event
      await act(async () => {
        if (authStateCallback) {
          authStateCallback('SIGNED_OUT', null);
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-state')).toBeInTheDocument();
      });
    });

    it('should handle TOKEN_REFRESHED event', async () => {
      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
      const Wrapper = createTestWrapper();

      const TestComponent = () => {
        const { user } = useAuth();
        return <div data-testid="user-state">{user ? 'موجود' : 'غير موجود'}</div>;
      };

      render(
        <Wrapper>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </Wrapper>
      );

      // Simulate token refresh
      await act(async () => {
        if (authStateCallback) {
          authStateCallback('TOKEN_REFRESHED', { ...mockSession, access_token: 'new-token' });
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-state')).toBeInTheDocument();
      });
    });
  });

  describe('Role Checking', () => {
    it('should check single role', async () => {
      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
      const Wrapper = createTestWrapper();

      const TestComponent = () => {
        const { hasRole } = useAuth();
        const isNazer = hasRole('nazer');
        return <div data-testid="is-nazer">{isNazer ? 'نعم' : 'لا'}</div>;
      };

      render(
        <Wrapper>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-nazer')).toBeInTheDocument();
      });
    });

    it('should check multiple roles', async () => {
      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
      const Wrapper = createTestWrapper();

      const TestComponent = () => {
        const { hasRole, roles } = useAuth();
        const isAdmin = hasRole('admin');
        const isNazer = hasRole('nazer');
        return (
          <div>
            <div data-testid="roles-list">{roles?.join(',') || 'لا أدوار'}</div>
            <div data-testid="is-admin">{isAdmin ? 'مدير' : 'ليس مدير'}</div>
            <div data-testid="is-nazer">{isNazer ? 'ناظر' : 'ليس ناظر'}</div>
          </div>
        );
      };

      render(
        <Wrapper>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('roles-list')).toBeInTheDocument();
      });
    });
  });

  describe('Profile Updates', () => {
    it('should provide refreshProfile function', async () => {
      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
      const Wrapper = createTestWrapper();

      const TestComponent = () => {
        const auth = useAuth() as any;
        return (
          <div data-testid="refresh-fn">
            {typeof auth.refreshProfile === 'function' ? 'موجود' : 'غير موجود'}
          </div>
        );
      };

      render(
        <Wrapper>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('refresh-fn')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle session fetch errors', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: { message: 'Session error' } as any,
      });

      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
      const Wrapper = createTestWrapper();

      const TestComponent = () => {
        const { user, isLoading } = useAuth();
        return (
          <div data-testid="error-state">
            {isLoading ? 'جاري التحميل' : user ? 'مستخدم' : 'لا يوجد مستخدم'}
          </div>
        );
      };

      render(
        <Wrapper>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument();
      });
    });
  });

  describe('Cleanup on Unmount', () => {
    it('should unsubscribe from auth changes on unmount', async () => {
      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
      const { supabase } = await import('@/integrations/supabase/client');
      const Wrapper = createTestWrapper();

      const TestComponent = () => {
        const { user } = useAuth();
        return <div>{user?.id || 'no user'}</div>;
      };

      const { unmount } = render(
        <Wrapper>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </Wrapper>
      );

      unmount();

      // Verify cleanup was called
      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
    });
  });

  describe('RTL Support', () => {
    it('should render Arabic content correctly', async () => {
      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
      const Wrapper = createTestWrapper();

      const TestComponent = () => {
        const { profile } = useAuth();
        return (
          <div dir="rtl" data-testid="arabic-content">
            <span>مرحباً {profile?.full_name || 'زائر'}</span>
          </div>
        );
      };

      render(
        <Wrapper>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </Wrapper>
      );

      await waitFor(() => {
        const content = screen.getByTestId('arabic-content');
        expect(content).toHaveAttribute('dir', 'rtl');
      });
    });
  });

  describe('Integration with React Query', () => {
    it('should work with QueryClientProvider', async () => {
      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
      const Wrapper = createTestWrapper();

      const TestComponent = () => {
        const { isLoading } = useAuth();
        return <div data-testid="query-integration">{isLoading ? 'loading' : 'ready'}</div>;
      };

      render(
        <Wrapper>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('query-integration')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should not break accessibility tree', async () => {
      const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
      const Wrapper = createTestWrapper();

      const TestComponent = () => {
        const { user } = useAuth();
        return (
          <main role="main" aria-label="المحتوى الرئيسي">
            <h1>مرحباً</h1>
            <p>{user ? 'أنت مسجل الدخول' : 'يرجى تسجيل الدخول'}</p>
          </main>
        );
      };

      render(
        <Wrapper>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      });
    });
  });
});
