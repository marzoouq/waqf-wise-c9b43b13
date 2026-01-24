/**
 * Test Data for E2E Tests
 * بيانات الاختبار للاختبارات الشاملة
 */

export const testUsers = {
  admin: { email: 'admin@test.waqf.sa', password: 'TestAdmin123!' },
  nazer: { email: 'nazer@test.waqf.sa', password: 'TestNazer123!' },
  accountant: { email: 'accountant@test.waqf.sa', password: 'TestAccountant123!' },
  beneficiary: { email: 'beneficiary@test.waqf.sa', password: 'TestBeneficiary123!' },
  cashier: { email: 'cashier@test.waqf.sa', password: 'TestCashier123!' },
};

export const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
  wide: { width: 1920, height: 1080 },
};

export const testRoutes = {
  landing: '/',
  login: '/login',
  dashboard: '/dashboard',
  beneficiaries: '/beneficiaries',
  properties: '/properties',
  tenants: '/tenants',
  accounting: '/accounting',
  invoices: '/invoices',
  settings: '/settings',
};

export const roleRoutes = {
  admin: '/admin-dashboard',
  nazer: '/nazer-dashboard',
  accountant: '/accountant-dashboard',
  beneficiary: '/beneficiary-portal',
  cashier: '/cashier-dashboard',
};

export const dynamicSelectors: string[] = [
  '[data-testid="loading"]',
  '[class*="skeleton"]',
  '[class*="spinner"]',
  '[data-loading="true"]',
];
