/**
 * Test Data for E2E Tests
 * بيانات الاختبار للاختبارات الشاملة
 */

export const testUsers = {
  staff: {
    email: 'staff@test.com',
    password: 'testpassword123',
  },
  admin: {
    email: 'admin@test.com',
    password: 'adminpassword123',
  },
  beneficiary: {
    nationalId: '1234567890',
    password: 'beneficiarypass123',
  },
};

export const viewports = {
  mobile: { width: 375, height: 667 },
  mobileLandscape: { width: 667, height: 375 },
  tablet: { width: 768, height: 1024 },
  tabletLandscape: { width: 1024, height: 768 },
  desktop: { width: 1280, height: 800 },
  wide: { width: 1920, height: 1080 },
};

export const testRoutes = {
  landing: '/',
  login: '/login',
  dashboard: '/dashboard',
  beneficiaries: '/beneficiaries',
  properties: '/properties',
  accounting: '/accounting',
  beneficiaryPortal: '/beneficiary-portal',
};

export const dynamicSelectors = [
  '[data-sonner-toast]',
  '[data-testid="loading"]',
  '.animate-pulse',
  '.animate-spin',
  '[data-testid="timestamp"]',
  '.skeleton',
];
