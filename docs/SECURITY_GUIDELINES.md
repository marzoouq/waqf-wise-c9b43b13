# 🛡️ إرشادات الأمان للمطورين

> **الإصدار:** 2.9.2  
> **آخر تحديث:** ديسمبر 2024

---

## 📋 الفهرس

1. [القواعد الذهبية](#القواعد-الذهبية)
2. [إضافة دور جديد](#إضافة-دور-جديد)
3. [إنشاء سياسات RLS](#إنشاء-سياسات-rls)
4. [أخطاء شائعة](#أخطاء-شائعة)
5. [قائمة المراجعة](#قائمة-المراجعة)

---

## القواعد الذهبية

### ⚠️ لا تفعل أبداً

```typescript
// ❌ خطأ: تخزين الأدوار في localStorage
localStorage.setItem('userRole', 'admin');

// ❌ خطأ: التحقق من الأدوار في الواجهة فقط
if (userRole === 'admin') {
  // عرض محتوى حساس
}

// ❌ خطأ: تخزين الأدوار في profiles
ALTER TABLE profiles ADD COLUMN role TEXT;

// ❌ خطأ: استخدام SECURITY INVOKER للتحقق
CREATE FUNCTION check_role() 
SECURITY INVOKER -- ❌ خطأ!
AS $$...$$;
```

### ✅ افعل دائماً

```typescript
// ✅ صحيح: جلب الأدوار من قاعدة البيانات
const { data: roles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id);

// ✅ صحيح: استخدام RLS للحماية
CREATE POLICY "admin_only" ON sensitive_table
USING (public.is_admin_or_nazer());

// ✅ صحيح: SECURITY DEFINER للدوال
CREATE FUNCTION has_role(...)
SECURITY DEFINER
SET search_path = public
AS $$...$$;
```

---

## إضافة دور جديد

### الخطوة 1: تحديث Enum في قاعدة البيانات

```sql
-- إضافة دور جديد للـ enum
ALTER TYPE public.app_role ADD VALUE 'auditor';
```

### الخطوة 2: تحديث ملف الأنواع

```typescript
// src/types/roles.ts

// إضافة الدور الجديد
export type AppRole = 
  | 'nazer' 
  | 'admin' 
  | 'accountant' 
  | 'cashier'
  | 'archivist' 
  | 'beneficiary'
  | 'waqf_heir'
  | 'user'
  | 'auditor'; // ← جديد

// إضافة التسمية العربية
export const ROLE_LABELS: Record<AppRole, string> = {
  // ... الأدوار السابقة
  auditor: 'المراجع',
};

// إضافة اللون
export const ROLE_COLORS: Record<AppRole, string> = {
  // ... الألوان السابقة
  auditor: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
};

// إضافة لوحة التحكم
export const ROLE_DASHBOARD_MAP: Record<AppRole, string> = {
  // ... اللوحات السابقة
  auditor: '/auditor',
};
```

### الخطوة 3: تحديث دوال التحقق (إذا لزم الأمر)

```sql
-- إذا كان الدور الجديد جزءاً من فريق معين
CREATE OR REPLACE FUNCTION public.is_audit_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('nazer', 'admin', 'auditor')
  )
$$;
```

### الخطوة 4: إضافة سياسات RLS

```sql
-- سياسات للدور الجديد
CREATE POLICY "auditor_read_financial_data"
ON public.journal_entries
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'auditor'));
```

### الخطوة 5: تحديث الواجهة

```tsx
// إضافة صفحة لوحة التحكم
// src/pages/AuditorDashboard.tsx

// تحديث التوجيه
// src/App.tsx
<Route path="/auditor" element={
  <ProtectedRoute requiredRole="auditor">
    <AuditorDashboard />
  </ProtectedRoute>
} />
```

---

## إنشاء سياسات RLS

### القالب الأساسي

```sql
-- سياسة القراءة
CREATE POLICY "[role]_read_[table]"
ON public.[table_name]
FOR SELECT
TO authenticated
USING (
  -- شرط الوصول
);

-- سياسة الإنشاء
CREATE POLICY "[role]_create_[table]"
ON public.[table_name]
FOR INSERT
TO authenticated
WITH CHECK (
  -- شرط الصلاحية
);

-- سياسة التعديل
CREATE POLICY "[role]_update_[table]"
ON public.[table_name]
FOR UPDATE
TO authenticated
USING (
  -- شرط القراءة
)
WITH CHECK (
  -- شرط الكتابة
);

-- سياسة الحذف
CREATE POLICY "[role]_delete_[table]"
ON public.[table_name]
FOR DELETE
TO authenticated
USING (
  -- شرط الحذف
);
```

### أنماط شائعة

#### 1. المالك فقط

```sql
-- المستخدم يرى بياناته فقط
CREATE POLICY "users_own_data"
ON public.user_settings
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

#### 2. الإدارة + المالك

```sql
-- الإدارة ترى الكل، المستخدم يرى بياناته
CREATE POLICY "admin_or_owner"
ON public.beneficiary_requests
FOR SELECT
TO authenticated
USING (
  public.is_admin_or_nazer()
  OR beneficiary_id IN (
    SELECT id FROM public.beneficiaries
    WHERE user_id = auth.uid()
  )
);
```

#### 3. فريق معين

```sql
-- الفريق المالي فقط
CREATE POLICY "financial_team_only"
ON public.bank_transactions
FOR ALL
TO authenticated
USING (public.is_financial_staff())
WITH CHECK (public.is_financial_staff());
```

#### 4. قراءة عامة، تعديل محدود

```sql
-- الجميع يقرأ، الإدارة تعدل
CREATE POLICY "public_read"
ON public.announcements
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admin_write"
ON public.announcements
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_nazer());
```

---

## أخطاء شائعة

### ❌ خطأ 1: نسيان SECURITY DEFINER

```sql
-- ❌ خطأ: سيسبب تكرار لا نهائي
CREATE FUNCTION check_access()
RETURNS boolean
LANGUAGE sql
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles  -- RLS ستستدعي الدالة مجدداً!
    WHERE user_id = auth.uid()
  )
$$;

-- ✅ صحيح
CREATE FUNCTION check_access()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER  -- ← مهم!
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
  )
$$;
```

### ❌ خطأ 2: سياسات متعارضة

```sql
-- ❌ خطأ: سياستان متعارضتان
CREATE POLICY "allow_all" ON table FOR SELECT USING (true);
CREATE POLICY "deny_all" ON table FOR SELECT USING (false);
-- النتيجة: السماح (OR بين السياسات)

-- ✅ صحيح: سياسة واحدة واضحة
CREATE POLICY "conditional_access" ON table
FOR SELECT
USING (
  public.is_admin_or_nazer()
  OR user_id = auth.uid()
);
```

### ❌ خطأ 3: التحقق في الواجهة فقط

```tsx
// ❌ خطأ: حماية واجهة فقط
function AdminButton() {
  const { isAdmin } = useUserRole();
  if (!isAdmin) return null;  // يمكن تجاوزها!
  return <Button onClick={deleteAll}>حذف الكل</Button>;
}

// ✅ صحيح: الحماية في قاعدة البيانات + الواجهة
// 1. RLS في قاعدة البيانات
CREATE POLICY "admin_delete" ON table
FOR DELETE USING (public.is_admin_or_nazer());

// 2. + إخفاء في الواجهة
function AdminButton() {
  const { isAdmin } = useUserRole();
  if (!isAdmin) return null;
  return <Button onClick={deleteAll}>حذف الكل</Button>;
}
```

### ❌ خطأ 4: استخدام auth.users مباشرة

```sql
-- ❌ خطأ: لا يمكن الوصول لـ auth.users من الواجهة
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id)  -- ❌
);

-- ✅ صحيح: استخدام user_id
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,  -- ✅ لا foreign key
  ...
);
```

### ❌ خطأ 5: تخزين الأدوار في الجلسة

```typescript
// ❌ خطأ: يمكن التلاعب بها
sessionStorage.setItem('role', 'admin');
const role = sessionStorage.getItem('role');

// ✅ صحيح: جلب من قاعدة البيانات
const { data } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id);
```

---

## قائمة المراجعة

### عند إضافة جدول جديد

- [ ] تفعيل RLS: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- [ ] إضافة سياسة SELECT للقراءة
- [ ] إضافة سياسة INSERT للإنشاء
- [ ] إضافة سياسة UPDATE للتعديل
- [ ] إضافة سياسة DELETE للحذف (إذا مطلوب)
- [ ] اختبار السياسات بأدوار مختلفة
- [ ] التأكد من عدم وجود سياسات متعارضة

### عند إضافة دور جديد

- [ ] إضافة للـ enum في قاعدة البيانات
- [ ] تحديث `src/types/roles.ts`
- [ ] إضافة التسمية العربية
- [ ] إضافة اللون
- [ ] إضافة لوحة التحكم
- [ ] تحديث دوال التحقق إذا لزم
- [ ] إضافة سياسات RLS المطلوبة
- [ ] إضافة صفحات الواجهة
- [ ] تحديث التوجيه
- [ ] اختبار الصلاحيات

### عند كتابة دالة تحقق

- [ ] استخدام `SECURITY DEFINER`
- [ ] تعيين `SET search_path = public`
- [ ] استخدام `STABLE` أو `IMMUTABLE`
- [ ] عدم الوصول لجداول محمية بـ RLS بدون DEFINER
- [ ] اختبار الدالة مع مستخدمين مختلفين

### مراجعة الأمان الدورية

- [ ] فحص سياسات RLS لجميع الجداول
- [ ] التأكد من عدم وجود `SECURITY INVOKER` في دوال التحقق
- [ ] فحص عدم تخزين أدوار في localStorage/sessionStorage
- [ ] التأكد من عدم وجود hardcoded credentials
- [ ] مراجعة سجلات التدقيق

---

## أدوات مفيدة

### فحص سياسات RLS لجدول

```sql
SELECT 
  policyname,
  cmd,
  qual::text as using_clause,
  with_check::text as check_clause
FROM pg_policies
WHERE tablename = 'your_table_name';
```

### فحص دوال SECURITY DEFINER

```sql
SELECT 
  proname as function_name,
  prosecdef as is_security_definer
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND prosecdef = true;
```

### اختبار صلاحيات مستخدم

```sql
-- تبديل المستخدم (للاختبار فقط)
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';

-- تنفيذ استعلام
SELECT * FROM protected_table;

-- إعادة التعيين
RESET ROLE;
```

---

## المراجع

- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

> 💡 **نصيحة:** عند الشك، اسأل: "هل هذه العملية محمية في قاعدة البيانات؟" إذا كانت الحماية في الواجهة فقط، فهي غير كافية.
