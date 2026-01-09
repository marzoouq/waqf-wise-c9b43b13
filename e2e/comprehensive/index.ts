/**
 * تصدير جميع اختبارات E2E الشاملة
 * @version 1.0.0
 */

// هذا الملف للتوثيق فقط
// اختبارات Playwright تعمل مباشرة من ملفات .spec.ts

export const COMPREHENSIVE_E2E_TESTS = {
  tabs: 'e2e/comprehensive/tabs.spec.ts',
  forms: 'e2e/comprehensive/forms.spec.ts',
  buttons: 'e2e/comprehensive/buttons.spec.ts',
  crud: 'e2e/comprehensive/crud.spec.ts',
};

export const EXISTING_E2E_TESTS = {
  auth: 'e2e/auth.spec.ts',
  navigation: 'e2e/navigation.spec.ts',
  accessibility: 'e2e/accessibility.spec.ts',
  responsive: 'e2e/responsive.spec.ts',
  visualRegression: 'e2e/visual-regression.spec.ts',
  beneficiaryLifecycle: 'e2e/beneficiary-lifecycle.spec.ts',
};
