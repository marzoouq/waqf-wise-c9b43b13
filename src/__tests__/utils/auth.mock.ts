/**
 * Auth Mock للاختبارات
 * يحاكي نظام المصادقة والأدوار
 */

import { vi } from 'vitest';

// أنواع المستخدمين الوهميين
export interface MockUser {
  id: string;
  email: string;
  roles: string[];
  beneficiary_id?: string;
}

// مستخدمين وهميين للاختبارات
export const mockUsers: Record<string, MockUser> = {
  admin: {
    id: 'user-admin-001',
    email: 'admin@waqf.sa',
    roles: ['admin', 'nazer'],
  },
  nazer: {
    id: 'user-nazer-001',
    email: 'nazer@waqf.sa',
    roles: ['nazer'],
  },
  accountant: {
    id: 'user-accountant-001',
    email: 'accountant@waqf.sa',
    roles: ['accountant'],
  },
  cashier: {
    id: 'user-cashier-001',
    email: 'cashier@waqf.sa',
    roles: ['cashier'],
  },
  archivist: {
    id: 'user-archivist-001',
    email: 'archivist@waqf.sa',
    roles: ['archivist'],
  },
  beneficiary: {
    id: 'user-beneficiary-001',
    email: 'beneficiary@waqf.sa',
    roles: ['beneficiary'],
    beneficiary_id: 'ben-001',
  },
  waqfHeir: {
    id: 'user-heir-001',
    email: 'heir@waqf.sa',
    roles: ['waqf_heir'],
    beneficiary_id: 'ben-001',
  },
  guest: {
    id: '',
    email: '',
    roles: [],
  },
};

// المستخدم الحالي للاختبار
let currentMockUser: MockUser = mockUsers.guest;

// تعيين المستخدم الحالي
export const setCurrentMockUser = (userType: keyof typeof mockUsers) => {
  currentMockUser = mockUsers[userType];
};

// الحصول على المستخدم الحالي
export const getCurrentMockUser = () => currentMockUser;

// إعادة تعيين المستخدم
export const resetMockUser = () => {
  currentMockUser = mockUsers.guest;
};

// Mock لـ AuthContext
export const mockAuthContext = {
  user: null as MockUser | null,
  isLoading: false,
  isAuthenticated: false,
  roles: [] as string[],
  hasRole: vi.fn((role: string) => currentMockUser.roles.includes(role)),
  hasAnyRole: vi.fn((roles: string[]) => roles.some(r => currentMockUser.roles.includes(r))),
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
  signInWithGoogle: vi.fn(),
};

// تحديث mock AuthContext
export const updateMockAuthContext = (userType: keyof typeof mockUsers) => {
  const user = mockUsers[userType];
  mockAuthContext.user = user.id ? user : null;
  mockAuthContext.isAuthenticated = !!user.id;
  mockAuthContext.roles = user.roles;
  mockAuthContext.hasRole = vi.fn((role: string) => user.roles.includes(role));
  mockAuthContext.hasAnyRole = vi.fn((roles: string[]) => roles.some(r => user.roles.includes(r)));
};

// Mock useAuth hook
export const createMockUseAuth = () => ({
  ...mockAuthContext,
  user: currentMockUser.id ? currentMockUser : null,
  isAuthenticated: !!currentMockUser.id,
  roles: currentMockUser.roles,
});

// تسجيل الدخول الوهمي
export const mockSignIn = vi.fn(async (email: string, password: string) => {
  const user = Object.values(mockUsers).find(u => u.email === email);
  if (user && password === 'password123') {
    setCurrentMockUser(Object.keys(mockUsers).find(k => mockUsers[k as keyof typeof mockUsers] === user) as keyof typeof mockUsers);
    return { success: true, user };
  }
  return { success: false, error: 'Invalid credentials' };
});

// تسجيل الخروج الوهمي
export const mockSignOut = vi.fn(async () => {
  resetMockUser();
  return { success: true };
});

// Mock للصلاحيات
export const mockPermissions = {
  canViewBeneficiaries: vi.fn(() => 
    ['admin', 'nazer', 'accountant', 'cashier'].some(r => currentMockUser.roles.includes(r))
  ),
  canEditBeneficiaries: vi.fn(() => 
    ['admin', 'nazer'].some(r => currentMockUser.roles.includes(r))
  ),
  canViewAccounting: vi.fn(() => 
    ['admin', 'nazer', 'accountant'].some(r => currentMockUser.roles.includes(r))
  ),
  canApproveDistributions: vi.fn(() => 
    ['nazer'].some(r => currentMockUser.roles.includes(r))
  ),
  canManageUsers: vi.fn(() => 
    ['admin'].some(r => currentMockUser.roles.includes(r))
  ),
};

// Mock module لـ useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => createMockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
