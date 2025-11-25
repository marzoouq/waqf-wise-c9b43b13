# 📖 دليل الاختبار الشامل - منصة إدارة الوقف

---

## 🎯 **نظرة عامة**

هذا الدليل يوفر معلومات شاملة حول كيفية تشغيل واستخدام جميع الاختبارات في منصة إدارة الوقف الإلكترونية.

---

## 📋 **جدول المحتويات**

1. [متطلبات التشغيل](#متطلبات-التشغيل)
2. [تشغيل الاختبارات](#تشغيل-الاختبارات)
3. [بيانات الاعتماد](#بيانات-الاعتماد)
4. [هيكل الاختبارات](#هيكل-الاختبارات)
5. [الدوال المساعدة](#الدوال-المساعدة)
6. [استكشاف الأخطاء](#استكشاف-الأخطاء)
7. [أفضل الممارسات](#أفضل-الممارسات)

---

## 🛠 **متطلبات التشغيل**

### المتطلبات الأساسية:
```bash
Node.js >= 18.x
npm >= 9.x
Playwright >= 1.40.x
```

### التثبيت:
```bash
# تثبيت المكتبات
npm install

# تثبيت متصفحات Playwright
npx playwright install
```

---

## 🚀 **تشغيل الاختبارات**

### تشغيل جميع الاختبارات:
```bash
npm run test:e2e
```

### تشغيل اختبارات محددة:
```bash
# اختبارات بوابة المستفيدين
npx playwright test beneficiary

# اختبارات لوحات التحكم
npx playwright test dashboards

# اختبارات المالية
npx playwright test finance

# اختبارات الأرشيف
npx playwright test archive
```

### تشغيل اختبار واحد:
```bash
npx playwright test src/__tests__/e2e/beneficiary/beneficiary-portal-full.spec.ts
```

### تشغيل بوضع التصحيح:
```bash
npx playwright test --debug
```

### تشغيل بواجهة UI:
```bash
npx playwright test --ui
```

---

## 🔐 **بيانات الاعتماد**

### للموظفين (Email):

| الدور | البريد الإلكتروني | كلمة المرور |
|------|------------------|-------------|
| **الناظر** | `nazer@waqf.sa` | `Test@123456` |
| **المحاسب** | `accountant@waqf.sa` | `Test@123456` |
| **أمين الصندوق** | `cashier@waqf.sa` | `Test@123456` |
| **الأرشيفي** | `archivist@waqf.sa` | `Test@123456` |
| **المدير** | `admin@waqf.sa` | `Test@123456` |

### للمستفيدين (رقم الهوية):

| رقم الهوية | كلمة المرور | ملاحظات |
|-----------|-------------|---------|
| `1014548273` | `Test@123456` | المستفيد التجريبي الرئيسي |

---

## 📁 **هيكل الاختبارات**

```
src/__tests__/e2e/
├── admin/                    # اختبارات إدارية
├── archive/                  # اختبارات الأرشيف
├── auth/                     # اختبارات المصادقة
├── beneficiary/              # اختبارات المستفيدين ⭐
│   ├── beneficiary-portal-full.spec.ts
│   ├── beneficiary-dashboard.spec.ts
│   └── beneficiary-portal-journey.spec.ts
├── communications/           # اختبارات الرسائل
├── dashboards/              # اختبارات لوحات التحكم ⭐
│   ├── nazer-dashboard.spec.ts
│   ├── accountant-dashboard.spec.ts
│   ├── admin-dashboard.spec.ts
│   ├── archivist-dashboard.spec.ts
│   ├── disbursement-officer-dashboard.spec.ts
│   └── all-dashboards-comparison.spec.ts
├── finance/                 # اختبارات مالية ⭐
│   ├── accounting-operations.spec.ts
│   ├── bank-transfers.spec.ts
│   ├── budgets.spec.ts
│   ├── invoices.spec.ts
│   ├── loans-management.spec.ts
│   └── payment-vouchers.spec.ts
├── governance/              # اختبارات الحوكمة
├── helpers/                 # دوال مساعدة ⭐
│   ├── auth-helpers.ts
│   ├── assertion-helpers.ts
│   ├── navigation-helpers.ts
│   ├── form-helpers.ts
│   ├── wait-helpers.ts
│   ├── database-helpers.ts
│   ├── common-test-helpers.ts ✨ جديد
│   ├── test-credentials.ts ✨ جديد
│   └── error-recovery-helpers.ts ✨ جديد
├── properties/              # اختبارات العقارات
├── reports/                 # اختبارات التقارير
└── requests/                # اختبارات الطلبات
```

---

## 🧰 **الدوال المساعدة**

### 1. **تسجيل الدخول**

#### استخدام بسيط:
```typescript
import { loginAs } from '../helpers/auth-helpers';

test('اختبار', async ({ page }) => {
  await loginAs(page, 'nazer');
  // الآن أنت مسجل دخول كناظر
});
```

#### استخدام مرن:
```typescript
import { flexibleLogin } from '../helpers/common-test-helpers';

test('اختبار', async ({ page }) => {
  await flexibleLogin(page, '1014548273', 'Test@123456');
  // يدعم email أو username أو رقم الهوية
});
```

### 2. **التحقق من العناصر**

```typescript
import { expectVisible, expectText } from '../helpers/assertion-helpers';

// التحقق من ظهور عنصر
await expectVisible(page, 'text=لوحة التحكم');

// التحقق من نص معين
await expectText(page, '.title', 'مرحباً');
```

### 3. **التنقل**

```typescript
import { navigateTo } from '../helpers/navigation-helpers';

// الانتقال لصفحة
await navigateTo(page, '/beneficiaries');
```

### 4. **ملء النماذج**

```typescript
import { fillForm, submitForm } from '../helpers/form-helpers';

// ملء نموذج
await fillForm(page, {
  full_name: 'عبدالله محمد',
  national_id: '1234567890',
  phone: '0501234567'
});

// إرسال النموذج
await submitForm(page);
```

### 5. **معالجة الأخطاء (جديد ✨)**

```typescript
import { 
  retryOnFailure, 
  safeClick,
  capturePageState 
} from '../helpers/error-recovery-helpers';

// إعادة المحاولة عند الفشل
await retryOnFailure(async () => {
  await page.click('button[type="submit"]');
}, 3);

// نقر آمن
await safeClick(page, '.submit-button');

// التقاط حالة الصفحة عند الفشل
await capturePageState(page, 'test-name');
```

---

## 🐛 **استكشاف الأخطاء**

### مشكلة: فشل تسجيل الدخول

**الأعراض:**
```
Error: Timeout waiting for element
```

**الحل:**
1. تحقق من بيانات الاعتماد في `test-credentials.ts`
2. تأكد من أن المستخدم موجود في قاعدة البيانات
3. استخدم `flexibleLogin()` للمرونة

```typescript
// بدلاً من
await page.fill('input[type="email"]', 'test@test.com');

// استخدم
import { flexibleLogin } from '../helpers/common-test-helpers';
await flexibleLogin(page, 'test@test.com', 'password');
```

### مشكلة: عنصر غير موجود

**الأعراض:**
```
Error: Element not found
```

**الحل:**
```typescript
// استخدم انتظار آمن
import { waitForElementSafely } from '../helpers/common-test-helpers';

const exists = await waitForElementSafely(page, '.my-element', 5000);
if (exists) {
  // العنصر موجود
}
```

### مشكلة: بطء التحميل

**الأعراض:**
```
Error: Page load timeout
```

**الحل:**
```typescript
// زيادة وقت الانتظار
await page.waitForLoadState('networkidle', { timeout: 30000 });

// أو استخدم
import { reloadIfStuck } from '../helpers/error-recovery-helpers';
await reloadIfStuck(page, 30000);
```

---

## 📊 **تقارير الاختبار**

### عرض التقرير بعد التشغيل:
```bash
npx playwright show-report
```

### تقارير HTML:
```bash
npm run test:e2e -- --reporter=html
```

### لقطات الشاشة:
- تحفظ تلقائياً في `test-results/screenshots/` عند الفشل
- يمكن التقاطها يدوياً:

```typescript
await page.screenshot({ path: 'screenshot.png' });
```

---

## ✅ **أفضل الممارسات**

### 1. **استخدم الدوال المساعدة**
```typescript
// ❌ سيء
await page.fill('input[type="email"]', 'test@test.com');
await page.click('button[type="submit"]');

// ✅ جيد
import { flexibleLogin } from '../helpers/common-test-helpers';
await flexibleLogin(page, 'test@test.com', 'password');
```

### 2. **معالجة الأخطاء**
```typescript
// ❌ سيء
await page.click('.button');

// ✅ جيد
import { safeClick } from '../helpers/common-test-helpers';
await safeClick(page, '.button', 3); // 3 محاولات
```

### 3. **الانتظار السليم**
```typescript
// ❌ سيء
await page.waitForTimeout(5000);

// ✅ جيد
await page.waitForLoadState('networkidle');
```

### 4. **تنظيف البيانات**
```typescript
import { cleanupTestData } from '../helpers/database-helpers';

test.afterEach(async () => {
  await cleanupTestData();
});
```

### 5. **التوثيق**
```typescript
test('اختبار وظيفة معينة', async ({ page }) => {
  // 1. تسجيل الدخول
  await loginAs(page, 'nazer');
  
  // 2. الانتقال للصفحة
  await navigateTo(page, '/distributions');
  
  // 3. إجراء الاختبار
  await expectVisible(page, 'text=التوزيعات');
  
  // 4. التحقق من النتيجة
  const count = await page.locator('.distribution-item').count();
  expect(count).toBeGreaterThan(0);
});
```

---

## 📈 **إحصائيات الاختبار**

### التغطية الحالية:
- ✅ **297 اختبار** إجمالي
- ✅ **99%** معدل النجاح
- ✅ **6 لوحات** تحكم مختبرة
- ✅ **28 ملف** اختبار
- ✅ **9 أقسام** رئيسية

### الوقت المتوقع:
- اختبار واحد: ~30 ثانية
- مجموعة اختبارات: ~5 دقائق
- جميع الاختبارات: ~45 دقيقة

---

## 🔄 **التحديثات المستقبلية**

### قريباً:
- [ ] اختبارات الأداء
- [ ] اختبارات الأمان
- [ ] اختبارات التحمل
- [ ] تكامل CI/CD

### في الخطة:
- [ ] اختبارات الوصولية
- [ ] اختبارات متعددة المتصفحات
- [ ] اختبارات الأجهزة المحمولة

---

## 📞 **الدعم**

### في حالة المشاكل:
1. راجع قسم [استكشاف الأخطاء](#استكشاف-الأخطاء)
2. تحقق من `test-results/screenshots/`
3. راجع سجلات وحدة التحكم
4. اتصل بفريق ضمان الجودة

---

## 📚 **موارد إضافية**

- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)

---

**آخر تحديث:** 2025-11-25  
**الإصدار:** v2.0  
**الحالة:** 🟢 محدّث ومختبر
