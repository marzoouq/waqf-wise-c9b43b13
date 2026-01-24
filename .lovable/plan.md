
# خطة إصلاح جميع أخطاء TypeScript في E2E Tests (39 خطأ)

## ملخص الأخطاء المتبقية

| الفئة | عدد الأخطاء | الملفات المتأثرة |
|-------|------------|-----------------|
| `document`/`window` غير موجود | 13 خطأ | 4 ملفات |
| `_page` غير موجود | 5 أخطاء | 2 ملفات |
| `_error`/`_data` تسمية خاطئة | 10 أخطاء | 1 ملف |
| `testRoutes`/`viewports` فارغة | 8 أخطاء | 2 ملفات |
| `getBoundingClientRect` | 2 خطأ | 1 ملف |
| `el` is `unknown` | 2 خطأ | 1 ملف |
| **الإجمالي** | **39 خطأ** | **10 ملفات** |

---

## التغييرات المطلوبة

### 1. `tsconfig.node.json` - إضافة DOM للـ lib

**السبب:** جميع أخطاء `document` و `window` و `getBoundingClientRect`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts", "playwright.config.ts", "e2e/**/*"]
}
```

**يحل:** 15 خطأ (document/window/getBoundingClientRect)

---

### 2. `e2e/fixtures/test-data.ts` - إعادة تعبئة البيانات

**السبب:** جميع exports فارغة `{}`

```typescript
/**
 * Test Data for E2E Tests
 * بيانات الاختبار للاختبارات الشاملة
 */

export const testUsers = {
  admin: { email: 'admin@test.waqf.sa', password: 'TestAdmin123!' },
  nazer: { email: 'nazer@test.waqf.sa', password: 'TestNazer123!' },
  accountant: { email: 'accountant@test.waqf.sa', password: 'TestAccountant123!' },
  beneficiary: { email: 'beneficiary@test.waqf.sa', password: 'TestBeneficiary123!' },
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
};

export const roleRoutes = {
  admin: '/admin-dashboard',
  nazer: '/nazer-dashboard',
  accountant: '/accountant-dashboard',
  beneficiary: '/beneficiary-portal',
};

export const dynamicSelectors: string[] = [
  '[data-testid="loading"]',
  '[class*="skeleton"]',
  '[class*="spinner"]',
  '[data-loading="true"]',
];
```

**يحل:** 8 أخطاء (landing, login, mobile, tablet, desktop, wide)

---

### 3. `e2e/fixtures/auth.fixture.ts` - إصلاح `_page`

**السبب:** استخدام `_page` غير موجود في AuthFixtures

```typescript
import { test as base, expect, Page } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const TEST_CREDENTIALS = {
  admin: { email: 'admin@test.waqf.sa', password: 'TestAdmin123!' },
  nazer: { email: 'nazer@test.waqf.sa', password: 'TestNazer123!' },
};

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export type UserRole = 'admin' | 'nazer' | 'accountant' | 'beneficiary' | 'cashier' | 'archivist' | string;

interface AuthFixtures {
  supabase: SupabaseClient;
  loginAs: (role: UserRole) => Promise<boolean>;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoggedIn: () => Promise<boolean>;
}

export const test = base.extend<AuthFixtures>({
  supabase: async ({}, use) => {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await use(client);
    await client.auth.signOut();
  },

  // إصلاح: استخدام page بدلاً من _page
  loginAs: async ({ page }, use) => {
    const loginAs = async (_role: UserRole): Promise<boolean> => {
      return false;
    };
    await use(loginAs);
  },

  loginWithCredentials: async ({ page }, use) => {
    const loginWithCredentials = async (_email: string, _password: string): Promise<boolean> => {
      return false;
    };
    await use(loginWithCredentials);
  },

  logout: async ({ page }, use) => {
    const logout = async (): Promise<void> => {};
    await use(logout);
  },

  isLoggedIn: async ({ page }, use) => {
    const isLoggedIn = async (): Promise<boolean> => {
      return false;
    };
    await use(isLoggedIn);
  },
});

export { expect };

export async function createAuthenticatedClient(_role: UserRole): Promise<SupabaseClient | null> {
  return null;
}

export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export async function waitForAuth(_page: Page, _timeout = 10000): Promise<boolean> {
  return false;
}
```

**يحل:** 4 أخطاء (الأسطر 37, 44, 51, 56)

---

### 4. `e2e/security/rls-policies.spec.ts` - إصلاح أسماء المتغيرات

**السبب:** استخدام `_error` ثم محاولة الوصول لـ `error`

| السطر | من | إلى |
|-------|-----|-----|
| 58 | `{ data, _error }` | `{ data, error }` |
| 67 | `{ data, _error }` | `{ data, error }` |
| 77 | `data?.length` (بعد `_data`) | `_data?.length` |
| 85 | `data?.length` (بعد `_data`) | `_data?.length` |
| 125 | `{ data: _beneficiaries, _error }` | `{ data: _beneficiaries, error }` |
| 128 | `expect(error)` | صحيح بعد الإصلاح |
| 143 | `{ data: _data, _error }` | `{ data: _data, error }` |
| 145 | `expect(error)` | صحيح بعد الإصلاح |
| 186 | `data?.length` | `_data?.length` |
| 274 | `data?.length` | `_data?.length` |

**يحل:** 10 أخطاء

---

### 5. `e2e/flows/zatca-journey.spec.ts` - إصلاح `_page`

**السطر 155:** تغيير `_page` إلى `request` أو حذف الـ destructuring

```typescript
// من:
test('التحقق من وجود وظيفة zatca-submit', async ({ _page }) => {
// إلى:
test('التحقق من وجود وظيفة zatca-submit', async ({ request }) => {
```

**يحل:** 1 خطأ

---

### 6. `e2e/accessibility/wcag-compliance.spec.ts` - إصلاح `el` type

**الأسطر 64-65:** إضافة type annotation

```typescript
// من:
.filter((el) => {
  const computed = window.getComputedStyle(el);
// إلى:
.filter((el: Element) => {
  const computed = window.getComputedStyle(el);
```

**يحل:** 2 خطأ (`el` is `unknown`)

---

## ملخص الملفات والتغييرات

| # | الملف | التغيير | الأخطاء المُحلّة |
|---|-------|---------|-----------------|
| 1 | `tsconfig.node.json` | إضافة `"DOM"` للـ lib | 15 |
| 2 | `e2e/fixtures/test-data.ts` | إعادة تعبئة viewports/routes | 8 |
| 3 | `e2e/fixtures/auth.fixture.ts` | `_page` → `page` | 4 |
| 4 | `e2e/security/rls-policies.spec.ts` | `_error` → `error`, `_data` corrections | 10 |
| 5 | `e2e/flows/zatca-journey.spec.ts` | `_page` → `request` | 1 |
| 6 | `e2e/accessibility/wcag-compliance.spec.ts` | `el` → `el: Element` | 1 |
| **الإجمالي** | **6 ملفات** | | **39 خطأ** |

---

## النتيجة المتوقعة

```text
قبل: 39 أخطاء TypeScript
بعد: 0 أخطاء TypeScript ✅

npm run build → SUCCESS
npm run test:e2e → READY
```

---

## ترتيب التنفيذ

1. **أولاً:** `tsconfig.node.json` (يحل أكبر عدد من الأخطاء)
2. **ثانياً:** `test-data.ts` (بيانات مفقودة)
3. **ثالثاً:** `auth.fixture.ts` (fixture errors)
4. **رابعاً:** `rls-policies.spec.ts` (variable naming)
5. **خامساً:** `zatca-journey.spec.ts` و `wcag-compliance.spec.ts`
