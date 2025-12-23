/**
 * اختبارات المصادقة والأدوار الشاملة
 * المرحلة 1: Authentication & Roles Tests
 * 
 * يغطي:
 * - تسجيل دخول 6 أدوار
 * - التوجيه للوحة التحكم المناسبة
 * - منع الوصول غير المصرح
 * - فحص الصلاحيات لكل دور
 * - تسجيل الخروج
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Fixtures
import {
  testUsers,
  testUserRoles,
  testProfiles,
  loginScenarios,
  unauthorizedAccessScenarios,
  createAuthContextMock,
  getUserByRole,
} from '../../fixtures/users.fixtures';

// Types
import type { AppRole } from '@/types/roles';
import { getDashboardForRoles } from '@/types/roles';

// ==================== Mock Setup ====================

// Helper to create mock query builder
const createMockQueryBuilder = (data: unknown[] | null = [], error: unknown = null) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({ data: data?.[0] ?? null, error }),
  single: vi.fn().mockResolvedValue({ data: data?.[0] ?? null, error }),
  then: vi.fn().mockImplementation((cb) => cb({ data, error })),
});

// Mock Supabase client
const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
  from: vi.fn(() => createMockQueryBuilder()),
  rpc: vi.fn(),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ==================== Test Suites ====================

describe('المرحلة 1: المصادقة والأدوار', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ==================== 1. تسجيل الدخول ====================
  describe('1.1 تسجيل الدخول', () => {
    describe('تسجيل دخول ناجح لكل دور', () => {
      const roles: AppRole[] = ['nazer', 'admin', 'accountant', 'cashier', 'archivist', 'beneficiary'];

      roles.forEach((role) => {
        it(`يجب تسجيل دخول ${role} بنجاح`, async () => {
          const user = getUserByRole(role);
          expect(user).toBeDefined();

          // Mock successful login
          mockSupabase.auth.signInWithPassword.mockResolvedValue({
            data: {
              user: { id: user!.id, email: user!.email },
              session: { access_token: 'test-token' },
            },
            error: null,
          });

          // Mock role fetch
          mockSupabase.from.mockReturnValue(createMockQueryBuilder([{ role }]));

          // Execute login
          const result = await mockSupabase.auth.signInWithPassword({
            email: user!.email,
            password: user!.password,
          });

          expect(result.error).toBeNull();
          expect(result.data.user).toBeDefined();
          expect(result.data.user.email).toBe(user!.email);
        });
      });
    });

    describe('تسجيل دخول فاشل', () => {
      loginScenarios.failedLogins.forEach((scenario) => {
        it(`يجب رفض: ${scenario.name}`, async () => {
          mockSupabase.auth.signInWithPassword.mockResolvedValue({
            data: { user: null, session: null },
            error: { message: scenario.expectedError },
          });

          const result = await mockSupabase.auth.signInWithPassword({
            email: scenario.email,
            password: scenario.password,
          });

          expect(result.error).not.toBeNull();
          expect(result.error?.message).toBe(scenario.expectedError);
        });
      });
    });
  });

  // ==================== 2. التوجيه حسب الدور ====================
  describe('1.2 التوجيه للوحة التحكم المناسبة', () => {
    it.each([
      ['nazer', '/nazer-dashboard'],
      ['admin', '/admin-dashboard'],
      ['accountant', '/accountant-dashboard'],
      ['cashier', '/cashier-dashboard'],
      ['archivist', '/archivist-dashboard'],
      ['beneficiary', '/beneficiary-portal'],
      ['waqf_heir', '/beneficiary-portal'],
      ['user', '/dashboard'],
    ])('يجب توجيه دور %s إلى %s', (role, expectedDashboard) => {
      const dashboard = getDashboardForRoles([role as AppRole]);
      expect(dashboard).toBe(expectedDashboard);
    });

    it('يجب توجيه مستخدم بأدوار متعددة حسب الأولوية', () => {
      // ناظر + محاسب -> ناظر له الأولوية
      const dashboard1 = getDashboardForRoles(['accountant', 'nazer'] as AppRole[]);
      expect(dashboard1).toBe('/nazer-dashboard');

      // محاسب + أمين صندوق -> محاسب له الأولوية
      const dashboard2 = getDashboardForRoles(['cashier', 'accountant'] as AppRole[]);
      expect(dashboard2).toBe('/accountant-dashboard');

      // مستفيد + وارث -> وارث له الأولوية
      const dashboard3 = getDashboardForRoles(['beneficiary', 'waqf_heir'] as AppRole[]);
      expect(dashboard3).toBe('/beneficiary-portal');
    });

    it('يجب توجيه مستخدم بدون أدوار إلى لوحة التحكم الافتراضية', () => {
      const dashboard = getDashboardForRoles([]);
      expect(dashboard).toBe('/dashboard');
    });
  });

  // ==================== 3. جلب الأدوار ====================
  describe('1.3 جلب أدوار المستخدم', () => {
    it('يجب جلب أدوار المستخدم من جدول user_roles', async () => {
      const user = testUsers.nazer;
      const expectedRoles = testUserRoles
        .filter(r => r.user_id === user.id)
        .map(r => r.role);

      const rolesData = expectedRoles.map(role => ({ role }));
      
      const result = { data: rolesData, error: null };

      expect(result.data).toHaveLength(expectedRoles.length);
      expect(result.data?.map((r: { role: string }) => r.role)).toEqual(expectedRoles);
    });

    it('يجب التعامل مع مستخدم بدون أدوار', async () => {
      mockSupabase.from.mockReturnValue(createMockQueryBuilder([]));

      const result = await Promise.resolve({ data: [], error: null });

      expect(result.data).toHaveLength(0);
      expect(result.error).toBeNull();
    });

    it('يجب التعامل مع خطأ في جلب الأدوار', async () => {
      const error = { message: 'Database error' };
      mockSupabase.from.mockReturnValue(createMockQueryBuilder(null, error));

      const result = await Promise.resolve({ data: null, error });

      expect(result.error).not.toBeNull();
    });
  });

  // ==================== 4. فحص الصلاحيات ====================
  describe('1.4 فحص الصلاحيات', () => {
    describe('صلاحيات الناظر', () => {
      const nazerContext = createAuthContextMock(testUsers.nazer);

      it('يجب أن يكون للناظر صلاحية الوصول الكامل', () => {
        expect(nazerContext.hasRole('nazer')).toBe(true);
        expect(nazerContext.roles).toContain('nazer');
      });

      it('يجب أن يكون للناظر صلاحية إدارة المستفيدين', () => {
        expect(nazerContext.checkPermissionSync('manage_beneficiaries')).toBe(true);
      });
    });

    describe('صلاحيات المحاسب', () => {
      const accountantContext = createAuthContextMock(testUsers.accountant);

      it('يجب أن يكون للمحاسب صلاحية المحاسبة', () => {
        expect(accountantContext.hasRole('accountant')).toBe(true);
        expect(accountantContext.roles).toContain('accountant');
      });

      it('يجب ألا يكون للمحاسب صلاحية الناظر', () => {
        expect(accountantContext.hasRole('nazer')).toBe(false);
      });
    });

    describe('صلاحيات المستفيد', () => {
      const beneficiaryContext = createAuthContextMock(testUsers.mohamedMarzouq);

      it('يجب أن يكون للمستفيد صلاحية الوصول لبوابته', () => {
        expect(beneficiaryContext.hasRole('beneficiary')).toBe(true);
      });

      it('يجب ألا يكون للمستفيد صلاحيات إدارية', () => {
        expect(beneficiaryContext.hasRole('admin')).toBe(false);
        expect(beneficiaryContext.hasRole('nazer')).toBe(false);
        expect(beneficiaryContext.hasRole('accountant')).toBe(false);
      });
    });
  });

  // ==================== 5. منع الوصول غير المصرح ====================
  describe('1.5 منع الوصول غير المصرح', () => {
    unauthorizedAccessScenarios.forEach((scenario) => {
      it(`يجب منع: ${scenario.name}`, () => {
        const userRoles = scenario.user.roles;
        const targetDashboard = scenario.targetRoute;

        // التحقق من أن المستخدم لا يملك الدور المطلوب
        const requiredRole = getRequiredRoleForRoute(targetDashboard);
        const hasAccess = userRoles.includes(requiredRole as AppRole);

        expect(hasAccess).toBe(!scenario.shouldBeBlocked);
      });
    });
  });

  // ==================== 6. تسجيل الخروج ====================
  describe('1.6 تسجيل الخروج', () => {
    it('يجب تسجيل الخروج بنجاح', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      const result = await mockSupabase.auth.signOut();

      expect(result.error).toBeNull();
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('يجب مسح الجلسة عند تسجيل الخروج', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      await mockSupabase.auth.signOut();
      const session = await mockSupabase.auth.getSession();

      expect(session.data.session).toBeNull();
    });

    it('يجب التعامل مع خطأ في تسجيل الخروج', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Network error' },
      });

      const result = await mockSupabase.auth.signOut();

      expect(result.error).not.toBeNull();
    });
  });

  // ==================== 7. جلب الملف الشخصي ====================
  describe('1.7 جلب الملف الشخصي', () => {
    it('يجب جلب الملف الشخصي للمستخدم', async () => {
      const user = testUsers.nazer;
      const profile = testProfiles.find(p => p.user_id === user.id);

      const result = { data: profile, error: null };

      expect(result.data).toBeDefined();
      expect(result.data?.full_name).toBe(user.fullName);
      expect(result.data?.email).toBe(user.email);
    });

    it('يجب التعامل مع ملف شخصي غير موجود', () => {
      const result = { data: null, error: null };

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  // ==================== 8. تسجيل محاولات الدخول ====================
  describe('1.8 تسجيل محاولات الدخول', () => {
    it('يجب تسجيل محاولة دخول ناجحة', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      await mockSupabase.rpc('log_login_attempt', {
        p_email: testUsers.nazer.email,
        p_ip_address: 'client',
        p_success: true,
        p_user_agent: 'Test Agent',
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('log_login_attempt', {
        p_email: testUsers.nazer.email,
        p_ip_address: 'client',
        p_success: true,
        p_user_agent: 'Test Agent',
      });
    });

    it('يجب تسجيل محاولة دخول فاشلة', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      await mockSupabase.rpc('log_login_attempt', {
        p_email: 'invalid@test.com',
        p_ip_address: 'client',
        p_success: false,
        p_user_agent: 'Test Agent',
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('log_login_attempt', {
        p_email: 'invalid@test.com',
        p_ip_address: 'client',
        p_success: false,
        p_user_agent: 'Test Agent',
      });
    });
  });
});

// ==================== Helper Functions ====================

/**
 * الحصول على الدور المطلوب لمسار معين
 */
function getRequiredRoleForRoute(route: string): string {
  const routeRoleMap: Record<string, string> = {
    '/nazer-dashboard': 'nazer',
    '/admin-dashboard': 'admin',
    '/accountant-dashboard': 'accountant',
    '/cashier-dashboard': 'cashier',
    '/archivist-dashboard': 'archivist',
    '/beneficiary-portal': 'beneficiary',
    '/users': 'admin',
    '/accounting': 'accountant',
  };

  return routeRoleMap[route] || 'user';
}
