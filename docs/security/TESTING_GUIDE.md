# 🧪 دليل اختبارات الأمان

> **آخر تحديث:** 2025-12-23  
> **إطار الاختبار:** Vitest

---

## 📋 نظرة عامة

هذا الدليل يشرح كيفية تشغيل وكتابة اختبارات الأمان لنظام إدارة الوقف.

---

## 🚀 تشغيل الاختبارات

### جميع اختبارات الأمان

```bash
npm run test:security
```

### اختبارات RLS فقط

```bash
npm run test -- src/__tests__/security/rls-integration.test.ts
```

### اختبارات الصلاحيات فقط

```bash
npm run test -- src/__tests__/security/permission-regression.test.ts
```

### مع التغطية

```bash
npm run test:coverage -- src/__tests__/security/
```

---

## 📁 هيكل الملفات

```
src/__tests__/security/
├── rls-integration.test.ts      # اختبارات RLS التكاملية
├── permission-regression.test.ts # اختبارات انحدار الصلاحيات
└── test-utils.ts                # أدوات الاختبار المشتركة
```

---

## 🔧 أدوات الاختبار

### إنشاء عميل مستخدم وهمي

```typescript
import { createMockUserClient } from './test-utils';

// إنشاء عميل لمستفيد
const beneficiaryClient = createMockUserClient({
  userId: 'beneficiary-uuid',
  role: 'beneficiary',
});

// إنشاء عميل لمحاسب
const accountantClient = createMockUserClient({
  userId: 'accountant-uuid',
  role: 'accountant',
});
```

### التحقق من الوصول

```typescript
import { expectAccessDenied, expectAccessAllowed } from './test-utils';

// التحقق من رفض الوصول
await expectAccessDenied(async () => {
  await client.from('user_roles').select('*');
});

// التحقق من السماح بالوصول
await expectAccessAllowed(async () => {
  await client.from('properties').select('*');
});
```

### إخفاء البيانات الحساسة

```typescript
import { maskSensitiveData } from './test-utils';

const maskedData = maskSensitiveData({
  national_id: '1234567890',
  iban: 'SA1234567890123456789012',
  phone: '0551234567',
});

// النتيجة:
// {
//   national_id: '1234****7890',
//   iban: 'SA12****9012',
//   phone: '055****567',
// }
```

---

## 📝 كتابة اختبار جديد

### قالب اختبار RLS

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createMockUserClient, setupTestData, cleanupTestData } from './test-utils';

describe('RLS: TableName', () => {
  let testData: TestData;

  beforeEach(async () => {
    testData = await setupTestData();
  });

  afterEach(async () => {
    await cleanupTestData(testData);
  });

  describe('SELECT', () => {
    it('role can read allowed data', async () => {
      const client = createMockUserClient({ role: 'role_name' });
      const { data, error } = await client
        .from('table_name')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      // تحقق إضافي
    });

    it('role cannot read forbidden data', async () => {
      const client = createMockUserClient({ role: 'other_role' });
      const { data } = await client
        .from('table_name')
        .select('*');

      expect(data).toHaveLength(0);
    });
  });

  describe('INSERT', () => {
    it('authorized role can insert', async () => {
      const client = createMockUserClient({ role: 'authorized_role' });
      const { error } = await client
        .from('table_name')
        .insert({ field: 'value' });

      expect(error).toBeNull();
    });

    it('unauthorized role cannot insert', async () => {
      const client = createMockUserClient({ role: 'unauthorized_role' });
      const { error } = await client
        .from('table_name')
        .insert({ field: 'value' });

      expect(error).not.toBeNull();
    });
  });
});
```

### قالب اختبار الصلاحيات

```typescript
import { describe, it, expect } from 'vitest';
import { PERMISSION_MATRIX, testPermissionMatrix } from './test-utils';

describe('Permission Matrix: TableName', () => {
  const tablePermissions = PERMISSION_MATRIX.table_name;

  Object.entries(tablePermissions).forEach(([role, permissions]) => {
    describe(`Role: ${role}`, () => {
      it(`has correct SELECT permission: ${permissions.select}`, async () => {
        await testPermissionMatrix('table_name', role, 'SELECT', permissions.select);
      });

      it(`has correct INSERT permission: ${permissions.insert}`, async () => {
        await testPermissionMatrix('table_name', role, 'INSERT', permissions.insert);
      });

      it(`has correct UPDATE permission: ${permissions.update}`, async () => {
        await testPermissionMatrix('table_name', role, 'UPDATE', permissions.update);
      });

      it(`has correct DELETE permission: ${permissions.delete}`, async () => {
        await testPermissionMatrix('table_name', role, 'DELETE', permissions.delete);
      });
    });
  });
});
```

---

## 🎯 القواعد الذهبية

### قواعد يجب اختبارها دائماً

```typescript
// 1. المستفيد لا يرى بيانات غيره
it('beneficiary cannot see other beneficiaries', async () => {
  // ...
});

// 2. المستخدم العادي لا يصل للأدوار
it('regular user cannot access roles table', async () => {
  // ...
});

// 3. لا يمكن تصعيد الصلاحيات
it('user cannot escalate own privileges', async () => {
  // ...
});

// 4. البيانات المالية محمية
it('financial data is protected', async () => {
  // ...
});

// 5. سجلات التدقيق لا تُحذف
it('audit logs cannot be deleted', async () => {
  // ...
});
```

---

## 📊 تغطية الاختبارات

### الجداول المختبرة

| الجدول | RLS | الصلاحيات | التكامل |
|--------|-----|-----------|---------|
| beneficiaries | ✅ | ✅ | ✅ |
| payment_vouchers | ✅ | ✅ | ✅ |
| journal_entries | ✅ | ✅ | ✅ |
| properties | ✅ | ✅ | ✅ |
| user_roles | ✅ | ✅ | ✅ |
| distributions | ✅ | ✅ | ✅ |
| audit_logs | ✅ | ✅ | ✅ |
| security_events | ✅ | ✅ | ✅ |
| families | ✅ | ✅ | ✅ |

### الأدوار المختبرة

- ✅ beneficiary (مستفيد)
- ✅ accountant (محاسب)
- ✅ cashier (صراف)
- ✅ nazer (ناظر)
- ✅ admin (مسؤول)
- ✅ archivist (أمين أرشيف)
- ✅ anonymous (مجهول)

---

## 🐛 استكشاف الأخطاء

### خطأ: "relation does not exist"

```bash
# تأكد من تشغيل الـ migrations
npx supabase db push
```

### خطأ: "permission denied"

```bash
# تحقق من سياسات RLS
SELECT * FROM pg_policies WHERE tablename = 'table_name';
```

### الاختبار بطيء جداً

```typescript
// استخدم beforeAll بدلاً من beforeEach للبيانات الثابتة
beforeAll(async () => {
  testData = await setupTestData();
});
```

---

## 🔗 مراجع

- `SECURITY.md` - سياسة الأمان
- `docs/security/RLS_POLICIES.md` - سياسات RLS
- [Vitest Documentation](https://vitest.dev/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)
