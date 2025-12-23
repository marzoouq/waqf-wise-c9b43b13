/**
 * بيانات المستخدمين للاختبار
 * Users Test Fixtures
 * 
 * المرحلة 1: المصادقة والأدوار
 * يحتوي على 6 مستخدمين للاختبار + بيانات الأدوار
 */

import type { AppRole } from '@/types/roles';

// ==================== أنواع البيانات ====================

export interface TestUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  roles: AppRole[];
  expectedDashboard: string;
  phone?: string;
  isActive: boolean;
  beneficiaryId?: string;
}

export interface TestUserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface TestProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== المستخدمون الستة للاختبار ====================

/**
 * 6 مستخدمين للاختبار - كل واحد بدور مختلف
 */
export const testUsers: Record<string, TestUser> = {
  // 1. الناظر - المسؤول الأعلى عن الوقف
  nazer: {
    id: 'c0f6bd1b-c23c-4c6c-b1f9-a4ee52b32f9e',
    email: 'nazer@waqf.test',
    password: 'TestPassword123!',
    fullName: 'ناظر الوقف',
    roles: ['nazer'],
    expectedDashboard: '/nazer-dashboard',
    phone: '+966500000001',
    isActive: true,
  },

  // 2. المشرف - مدير النظام
  admin: {
    id: 'a44b7ccd-c78a-41eb-8bb2-7c24ccac7c27',
    email: 'admin@waqf.sa',
    password: 'AdminPassword123!',
    fullName: 'مدير النظام',
    roles: ['admin'],
    expectedDashboard: '/admin-dashboard',
    phone: '+966500000002',
    isActive: true,
  },

  // 3. المحاسب - مسؤول المحاسبة
  accountant: {
    id: '2dcff368-32f8-4460-8a57-cd9fed1eb9cc',
    email: 'accountant@waqf.test',
    password: 'AccountantPassword123!',
    fullName: 'المحاسب',
    roles: ['accountant'],
    expectedDashboard: '/accountant-dashboard',
    phone: '+966500000003',
    isActive: true,
  },

  // 4. أمين الصندوق - مسؤول الصرف
  cashier: {
    id: '01d01b68-5bd8-4273-8490-6eb955100e39',
    email: 'cashier@waqf.test',
    password: 'CashierPassword123!',
    fullName: 'أمين الصندوق',
    roles: ['cashier'],
    expectedDashboard: '/cashier-dashboard',
    phone: '+966500000004',
    isActive: true,
  },

  // 5. أمين الأرشيف - مسؤول المستندات
  archivist: {
    id: '67c90bd8-d926-488f-a57f-25656a8c0d48',
    email: 'archivist@waqf.test',
    password: 'ArchivistPassword123!',
    fullName: 'أمين الأرشيف',
    roles: ['archivist'],
    expectedDashboard: '/archivist-dashboard',
    phone: '+966500000005',
    isActive: true,
  },

  // 6. محمد مرزوق علي الثبيتي - مستفيد حقيقي
  mohamedMarzouq: {
    id: 'd6a2e7b1-63ac-4088-96ae-df4230dd04f8',
    email: '1086970629@waqf.internal',
    password: 'Beneficiary123!',
    fullName: 'محمد مرزوق علي الثبيتي',
    roles: ['beneficiary'],
    expectedDashboard: '/beneficiary-portal',
    phone: '+966555555555',
    isActive: true,
    beneficiaryId: '7e38e686-919b-4e49-b8e6-384322172cb8',
  },
};

// ==================== بيانات الأدوار ====================

/**
 * بيانات جدول user_roles للاختبار
 */
export const testUserRoles: TestUserRole[] = [
  // ناظر
  {
    id: '42b7bc93-6c81-4643-b212-173f2ee36cdb',
    user_id: testUsers.nazer.id,
    role: 'nazer',
    created_at: '2025-11-13T12:00:15.588901+00:00',
  },
  // أدمن
  {
    id: '2b2f65c6-a2e1-484b-848b-149d37f53b1a',
    user_id: testUsers.admin.id,
    role: 'admin',
    created_at: '2025-11-13T12:00:15.588901+00:00',
  },
  // محاسب
  {
    id: '63f36765-f49d-4fc2-bf91-bb3cdb20104d',
    user_id: testUsers.accountant.id,
    role: 'accountant',
    created_at: '2025-11-13T12:00:15.588901+00:00',
  },
  // أمين صندوق
  {
    id: 'cda32a4d-ba27-4fb6-a1b1-d928224d1e93',
    user_id: testUsers.cashier.id,
    role: 'cashier',
    created_at: '2025-11-13T12:00:15.588901+00:00',
  },
  // أرشيفي
  {
    id: '2b97efce-ac73-4da3-95c7-1c5baf746aac',
    user_id: testUsers.archivist.id,
    role: 'archivist',
    created_at: '2025-11-13T12:00:15.588901+00:00',
  },
  // محمد مرزوق - مستفيد
  {
    id: '8b97f38b-3015-45f4-8f1f-1401d522a38e',
    user_id: testUsers.mohamedMarzouq.id,
    role: 'beneficiary',
    created_at: '2025-12-16T20:08:17.992781+00:00',
  },
];

// ==================== بيانات الملفات الشخصية ====================

/**
 * بيانات جدول profiles للاختبار
 */
export const testProfiles: TestProfile[] = Object.values(testUsers).map(user => ({
  id: `profile-${user.id}`,
  user_id: user.id,
  email: user.email,
  full_name: user.fullName,
  phone: user.phone || null,
  avatar_url: null,
  is_active: user.isActive,
  created_at: '2025-11-13T12:00:00.000000+00:00',
  updated_at: '2025-11-13T12:00:00.000000+00:00',
}));

// ==================== دوال مساعدة ====================

/**
 * الحصول على مستخدم حسب الدور
 */
export function getUserByRole(role: AppRole): TestUser | undefined {
  return Object.values(testUsers).find(user => user.roles.includes(role));
}

/**
 * الحصول على جميع المستخدمين كمصفوفة
 */
export function getAllTestUsers(): TestUser[] {
  return Object.values(testUsers);
}

/**
 * الحصول على أدوار مستخدم معين
 */
export function getRolesForUser(userId: string): AppRole[] {
  return testUserRoles
    .filter(role => role.user_id === userId)
    .map(role => role.role);
}

/**
 * التحقق من صلاحية مستخدم لدور معين
 */
export function userHasRole(userId: string, role: AppRole): boolean {
  return testUserRoles.some(r => r.user_id === userId && r.role === role);
}

/**
 * الحصول على لوحة التحكم المتوقعة حسب الأدوار
 */
export function getExpectedDashboard(roles: AppRole[]): string {
  const rolePriority: AppRole[] = [
    'nazer',
    'admin',
    'accountant',
    'cashier',
    'archivist',
    'waqf_heir',
    'beneficiary',
    'user',
  ];

  const dashboardMap: Record<AppRole, string> = {
    nazer: '/nazer-dashboard',
    admin: '/admin-dashboard',
    accountant: '/accountant-dashboard',
    cashier: '/cashier-dashboard',
    archivist: '/archivist-dashboard',
    beneficiary: '/beneficiary-portal',
    waqf_heir: '/beneficiary-portal',
    user: '/dashboard',
  };

  for (const role of rolePriority) {
    if (roles.includes(role)) {
      return dashboardMap[role];
    }
  }

  return '/dashboard';
}

// ==================== بيانات سيناريوهات الاختبار ====================

/**
 * سيناريوهات تسجيل الدخول
 */
export const loginScenarios = {
  // تسجيل دخول ناجح لكل دور
  successfulLogins: Object.entries(testUsers).map(([key, user]) => ({
    name: key,
    email: user.email,
    password: user.password,
    expectedDashboard: user.expectedDashboard,
    roles: user.roles,
  })),

  // محاولات فاشلة
  failedLogins: [
    {
      name: 'بريد غير موجود',
      email: 'nonexistent@waqf.test',
      password: 'WrongPassword123!',
      expectedError: 'Invalid login credentials',
    },
    {
      name: 'كلمة مرور خاطئة',
      email: testUsers.nazer.email,
      password: 'WrongPassword123!',
      expectedError: 'Invalid login credentials',
    },
    {
      name: 'بريد فارغ',
      email: '',
      password: 'Password123!',
      expectedError: 'Invalid login credentials',
    },
    {
      name: 'كلمة مرور فارغة',
      email: testUsers.nazer.email,
      password: '',
      expectedError: 'Invalid login credentials',
    },
  ],
};

/**
 * سيناريوهات الصلاحيات
 */
export const permissionScenarios = {
  // صلاحيات الناظر - الوصول الكامل
  nazerPermissions: {
    canAccessNazerDashboard: true,
    canAccessAdminDashboard: false,
    canManageUsers: true,
    canManageBeneficiaries: true,
    canManageProperties: true,
    canManageAccounting: true,
    canPublishFiscalYear: true,
    canDistributeRevenue: true,
  },

  // صلاحيات المحاسب
  accountantPermissions: {
    canAccessNazerDashboard: false,
    canAccessAccountantDashboard: true,
    canManageJournalEntries: true,
    canApproveJournalEntries: true,
    canViewFinancialReports: true,
    canManageUsers: false,
  },

  // صلاحيات المستفيد
  beneficiaryPermissions: {
    canAccessNazerDashboard: false,
    canAccessBeneficiaryPortal: true,
    canViewOwnPayments: true,
    canSubmitRequests: true,
    canViewOwnDistributions: true,
    canManageOtherBeneficiaries: false,
  },
};

/**
 * سيناريوهات منع الوصول
 */
export const unauthorizedAccessScenarios = [
  {
    name: 'محاسب يحاول الوصول للوحة الناظر',
    user: testUsers.accountant,
    targetRoute: '/nazer-dashboard',
    shouldBeBlocked: true,
  },
  {
    name: 'مستفيد يحاول الوصول للوحة المحاسب',
    user: testUsers.mohamedMarzouq,
    targetRoute: '/accountant-dashboard',
    shouldBeBlocked: true,
  },
  {
    name: 'أمين صندوق يحاول الوصول لإدارة المستخدمين',
    user: testUsers.cashier,
    targetRoute: '/users',
    shouldBeBlocked: true,
  },
  {
    name: 'أرشيفي يحاول الوصول للمحاسبة',
    user: testUsers.archivist,
    targetRoute: '/accounting',
    shouldBeBlocked: true,
  },
];

// ==================== إعداد بيانات Mock ====================

/**
 * إعداد بيانات المستخدمين للاختبار
 */
export const setupUsersMockData = (
  setMockTableData: <T>(table: string, data: T[]) => void
) => {
  setMockTableData('user_roles', testUserRoles);
  setMockTableData('profiles', testProfiles);
};

/**
 * إنشاء mock لـ AuthContext لمستخدم معين
 */
export const createAuthContextMock = (user: TestUser) => ({
  user: {
    id: user.id,
    email: user.email,
    app_metadata: {},
    user_metadata: { full_name: user.fullName },
    aud: 'authenticated',
    created_at: '2025-11-13T12:00:00.000000+00:00',
  },
  profile: {
    id: `profile-${user.id}`,
    user_id: user.id,
    email: user.email,
    full_name: user.fullName,
    phone: user.phone || null,
    avatar_url: null,
    is_active: user.isActive,
    created_at: '2025-11-13T12:00:00.000000+00:00',
    updated_at: '2025-11-13T12:00:00.000000+00:00',
  },
  roles: user.roles,
  rolesLoading: false,
  isLoading: false,
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  hasPermission: async (permission: string) => true,
  isRole: async (role: string) => user.roles.includes(role as AppRole),
  checkPermissionSync: (permission: string) => true,
  hasRole: (role: string) => user.roles.includes(role as AppRole),
});

// ==================== تصدير المستخدمين بشكل فردي ====================

export const nazerUser = testUsers.nazer;
export const adminUser = testUsers.admin;
export const accountantUser = testUsers.accountant;
export const cashierUser = testUsers.cashier;
export const archivistUser = testUsers.archivist;
export const mohamedMarzouq = testUsers.mohamedMarzouq;

export default testUsers;
