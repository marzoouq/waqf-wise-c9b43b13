/**
 * بيانات اعتماد الاختبار الموحدة
 * استخدم هذا الملف للحصول على بيانات تسجيل الدخول لجميع الأدوار
 */

export interface TestCredentials {
  identifier: string; // يمكن أن يكون email أو username أو national_id
  password: string;
  role: string;
}

export const TEST_CREDENTIALS: Record<string, TestCredentials> = {
  nazer: {
    identifier: 'nazer@waqf.sa',
    password: 'Test@123456',
    role: 'nazer',
  },
  accountant: {
    identifier: 'alkayala2@hotmail.com', // المحاسب الفعلي
    password: 'Test@123456',
    role: 'accountant',
  },
  cashier: {
    identifier: 'cashier@waqf.sa',
    password: 'Test@123456',
    role: 'cashier',
  },
  archivist: {
    identifier: 'archivist@waqf.sa',
    password: 'Test@123456',
    role: 'archivist',
  },
  admin: {
    identifier: 'admin@waqf.sa',
    password: 'Test@123456',
    role: 'admin',
  },
  beneficiary: {
    identifier: '1014548273', // رقم الهوية الوطنية للمستفيد التجريبي
    password: 'Test@123456',
    role: 'beneficiary',
  },
};

/**
 * الحصول على بيانات اعتماد اختبار حسب الدور
 */
export function getTestCredentials(role: keyof typeof TEST_CREDENTIALS): TestCredentials {
  return TEST_CREDENTIALS[role];
}

/**
 * التحقق من صحة بيانات الاعتماد
 */
export function isValidRole(role: string): role is keyof typeof TEST_CREDENTIALS {
  return role in TEST_CREDENTIALS;
}
