# 📋 سياسات Row Level Security (RLS)

> **آخر تحديث:** 2025-12-23  
> **نسبة التغطية:** 90%+

---

## 🎯 نظرة عامة

Row Level Security (RLS) هي آلية حماية على مستوى قاعدة البيانات تضمن أن كل مستخدم يرى فقط البيانات المصرح له بها.

---

## 📊 الجداول والسياسات

### 1. جدول المستفيدين (`beneficiaries`)

```sql
-- المستفيد يرى بياناته فقط
CREATE POLICY "beneficiaries_own_data" ON beneficiaries
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    public.has_role(auth.uid(), 'nazer') OR
    public.has_role(auth.uid(), 'admin')
  );

-- الإدراج للمسؤولين فقط
CREATE POLICY "beneficiaries_insert" ON beneficiaries
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'nazer') OR
    public.has_role(auth.uid(), 'admin')
  );

-- التحديث محدود
CREATE POLICY "beneficiaries_update" ON beneficiaries
  FOR UPDATE
  USING (
    user_id = auth.uid() OR
    public.has_role(auth.uid(), 'nazer') OR
    public.has_role(auth.uid(), 'admin')
  );
```

### 2. سندات الصرف (`payment_vouchers`)

```sql
-- القراءة للمستفيد صاحب السند أو المسؤولين
CREATE POLICY "vouchers_read" ON payment_vouchers
  FOR SELECT
  USING (
    beneficiary_id IN (
      SELECT id FROM beneficiaries WHERE user_id = auth.uid()
    ) OR
    public.has_role(auth.uid(), 'nazer') OR
    public.has_role(auth.uid(), 'accountant') OR
    public.has_role(auth.uid(), 'cashier')
  );

-- الإنشاء للمحاسبين فقط
CREATE POLICY "vouchers_create" ON payment_vouchers
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'nazer') OR
    public.has_role(auth.uid(), 'accountant')
  );
```

### 3. القيود اليومية (`journal_entries`)

```sql
-- القراءة للمحاسبين والناظر
CREATE POLICY "journals_read" ON journal_entries
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'nazer') OR
    public.has_role(auth.uid(), 'accountant') OR
    public.has_role(auth.uid(), 'admin')
  );

-- الإنشاء للمحاسبين فقط
CREATE POLICY "journals_create" ON journal_entries
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'accountant') OR
    public.has_role(auth.uid(), 'nazer')
  );
```

### 4. الأدوار (`user_roles`)

```sql
-- القراءة للمسؤولين فقط
CREATE POLICY "roles_read" ON user_roles
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'nazer') OR
    user_id = auth.uid()  -- المستخدم يرى دوره
  );

-- التعديل للناظر فقط
CREATE POLICY "roles_modify" ON user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'nazer'));
```

---

## 🔧 الدوال المساعدة

### دالة فحص الدور

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

### دالة الحصول على دور المستخدم

```sql
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;
```

---

## 📋 مصفوفة الوصول

| الجدول | مستفيد | محاسب | صراف | ناظر | مسؤول |
|--------|--------|-------|------|------|-------|
| beneficiaries | 👁️ بياناته | 👁️ الكل | ❌ | ✅ كامل | ✅ كامل |
| payment_vouchers | 👁️ سنداته | ✅ إنشاء/قراءة | 👁️ قراءة | ✅ كامل | 👁️ قراءة |
| journal_entries | ❌ | ✅ إنشاء/قراءة | ❌ | ✅ كامل | 👁️ قراءة |
| properties | 👁️ قراءة | 👁️ قراءة | 👁️ قراءة | ✅ كامل | ✅ كامل |
| user_roles | 👁️ دوره | ❌ | ❌ | ✅ كامل | 👁️ قراءة |
| distributions | 👁️ توزيعاته | 👁️ قراءة | ❌ | ✅ كامل | 👁️ قراءة |

**الرموز:**
- ✅ = وصول كامل (CRUD)
- 👁️ = قراءة فقط (أو محدود)
- ❌ = ممنوع

---

## 🧪 اختبار السياسات

### اختبار يدوي

```sql
-- تحقق من السياسات على جدول معين
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'beneficiaries';
```

### اختبار آلي

```typescript
// src/__tests__/security/rls-integration.test.ts
describe('RLS: Beneficiaries', () => {
  it('beneficiary sees only own data', async () => {
    const client = createClientAsUser(beneficiaryUserId);
    const { data } = await client
      .from('beneficiaries')
      .select('*');
    
    expect(data).toHaveLength(1);
    expect(data[0].user_id).toBe(beneficiaryUserId);
  });
});
```

---

## ⚠️ تحذيرات مهمة

### 1. لا تعطل RLS أبداً

```sql
-- ❌ خطير جداً!
ALTER TABLE beneficiaries DISABLE ROW LEVEL SECURITY;

-- ✅ الصحيح: أضف سياسة جديدة
CREATE POLICY "new_policy" ON beneficiaries ...;
```

### 2. تجنب SECURITY DEFINER إلا للضرورة

```sql
-- استخدم SECURITY DEFINER فقط للدوال المساعدة
-- مثل has_role() التي تحتاج تجاوز RLS
```

### 3. اختبر قبل النشر

```bash
npm run test:security
```

---

## 📝 إضافة سياسة جديدة

### الخطوات

1. **حدد المتطلبات**: من يحتاج الوصول؟
2. **اكتب السياسة**: استخدم `has_role()` للأدوار
3. **أضف اختبار**: في `src/__tests__/security/`
4. **شغّل الاختبارات**: تأكد من النجاح
5. **وثّق**: حدّث هذا الملف

### قالب

```sql
-- اسم وصفي
CREATE POLICY "table_action_who" ON table_name
  FOR SELECT|INSERT|UPDATE|DELETE|ALL
  USING (
    -- شرط الوصول
    public.has_role(auth.uid(), 'role_name')
  )
  WITH CHECK (
    -- شرط الإدراج/التحديث (اختياري)
  );
```

---

## 🔗 مراجع

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- `SECURITY.md` - سياسة الأمان العامة
