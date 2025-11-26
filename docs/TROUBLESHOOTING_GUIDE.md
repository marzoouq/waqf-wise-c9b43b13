# 🔍 دليل حل المشاكل الشامل

## 📑 فهرس المشاكل الشائعة

1. [مشاكل المصادقة](#مشاكل-المصادقة)
2. [مشاكل قاعدة البيانات](#مشاكل-قاعدة-البيانات)
3. [مشاكل الأداء](#مشاكل-الأداء)
4. [مشاكل الواجهة](#مشاكل-الواجهة)
5. [مشاكل RLS](#مشاكل-rls)

---

## 🔐 مشاكل المصادقة

### المشكلة: "useAuth must be used within AuthProvider"

**الأعراض:**
- خطأ في Console
- الصفحة لا تعمل
- لا يمكن تسجيل الدخول

**السبب:**
استخدام `useAuth()` خارج `<AuthProvider>`

**الحل:**
```tsx
// ✅ صحيح - داخل AuthProvider
<AuthProvider>
  <YourComponent />  {/* يمكن استخدام useAuth هنا */}
</AuthProvider>

// ❌ خطأ - خارج AuthProvider
<YourComponent />  {/* لا يمكن استخدام useAuth هنا */}
<AuthProvider>
  ...
</AuthProvider>
```

**التحقق:**
1. افتح `src/App.tsx`
2. تأكد من أن `<AuthProvider>` يغلف كل المكونات
3. تأكد من عدم استخدام `useAuth()` في `App.tsx` مباشرة

---

### المشكلة: "Database error saving new user"

**الأعراض:**
- خطأ عند إنشاء حساب جديد
- رسالة خطأ غير واضحة

**السبب:**
- Foreign key constraint violation
- Unique constraint violation
- بيانات ناقصة

**الحل:**
```typescript
// تم إصلاح هذا في AuthContext.tsx
// التحقق من نوع الخطأ ومعالجته بشكل صحيح

if (error.code === '23503') {
  // Foreign key violation
  console.error('User ID not found in auth.users');
}

if (error.code === '23505') {
  // Unique violation - profile already exists
  // نحاول استرجاعه
}
```

**التحقق:**
1. افتح `src/contexts/AuthContext.tsx`
2. تأكد من وجود معالجة error codes
3. راجع Postgres logs للتفاصيل

---

### المشكلة: لا يمكن تسجيل الدخول

**الأعراض:**
- كلمة المرور صحيحة لكن لا يعمل
- رسالة "Invalid credentials"

**التشخيص:**
```bash
# 1. تحقق من Supabase Auth
- افتح Cloud Dashboard
- تحقق من وجود المستخدم في Auth users

# 2. تحقق من profiles table
SELECT * FROM profiles WHERE email = 'user@example.com';

# 3. تحقق من user_roles
SELECT * FROM user_roles WHERE user_id = 'xxx';
```

**الحل:**
```sql
-- إذا كان user موجود لكن لا يوجد profile
INSERT INTO profiles (user_id, email, full_name)
VALUES ('user-id', 'user@example.com', 'Full Name');

-- إذا لم يكن لديه role
INSERT INTO user_roles (user_id, role_id)
SELECT 'user-id', id FROM roles WHERE role_name = 'beneficiary';
```

---

## 🗄️ مشاكل قاعدة البيانات

### المشكلة: "permission denied for table X"

**الأعراض:**
- خطأ عند محاولة قراءة/كتابة بيانات
- رسالة Permission denied

**السبب:**
سياسة RLS تمنع الوصول

**التشخيص:**
```sql
-- تحقق من RLS policies للجدول
SELECT * FROM pg_policies WHERE tablename = 'table_name';

-- تحقق من دور المستخدم
SELECT * FROM user_roles WHERE user_id = auth.uid();
```

**الحل:**
```sql
-- أضف أو عدل السياسة حسب الحاجة
CREATE POLICY "policy_name"
ON table_name
FOR SELECT
TO authenticated
USING (/* condition */);
```

---

### المشكلة: "Cannot read properties of undefined (filter)"

**الأعراض:**
- خطأ JavaScript في Console
- صفحة فارغة أو معطلة

**السبب:**
استدعاء `.filter()` على قيمة undefined أو null

**الحل المطبق:**
```typescript
// ✅ استخدم المساعدات الآمنة
import { safeFilter } from '@/utils/safeArrayHelpers';

// بدلاً من
const active = data.filter(item => item.active); // ❌

// استخدم
const active = safeFilter(data, item => item.active); // ✅
```

**الأماكن الشائعة:**
- عند تحميل البيانات من API
- في useQuery hooks قبل اكتمال التحميل
- عند عمل filter على props

**التحقق:**
```typescript
// دائماً تحقق قبل filter
if (Array.isArray(data)) {
  const filtered = data.filter(...);
}

// أو استخدم المساعدات الآمنة
import { safeFilter } from '@/utils/safeArrayHelpers';
```

---

### المشكلة: بطء في الاستعلامات

**الأعراض:**
- الصفحة تستغرق وقت طويل للتحميل
- "Loading..." لا ينتهي

**التشخيص:**
```sql
-- ابحث عن الاستعلامات البطيئة
SELECT 
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**الحل:**
```sql
-- أضف indexes للأعمدة المستخدمة في WHERE
CREATE INDEX idx_table_column ON table_name(column_name);

-- أضف indexes للأعمدة المستخدمة في JOIN
CREATE INDEX idx_table_fk ON table_name(foreign_key_column);

-- indexes composite للبحث المتعدد
CREATE INDEX idx_table_multi ON table_name(col1, col2);
```

---

## ⚡ مشاكل الأداء

### المشكلة: صفحة بطيئة جداً

**التشخيص:**
```typescript
// 1. افتح React Query DevTools
// انظر للاستعلامات البطيئة

// 2. افتح Network tab
// انظر للطلبات الكبيرة أو البطيئة

// 3. افتح Performance tab
// سجل وحلل الأداء
```

**الحلول الشائعة:**

#### أ. تقليل البيانات المحملة
```typescript
// ❌ تحميل كل البيانات
const { data } = useQuery({
  queryKey: ['all-data'],
  queryFn: () => supabase.from('table').select('*')
});

// ✅ تحميل الحقول المطلوبة فقط
const { data } = useQuery({
  queryKey: ['required-data'],
  queryFn: () => supabase
    .from('table')
    .select('id, name, status')
    .limit(20)
});
```

#### ب. استخدام Pagination
```typescript
const [page, setPage] = useState(1);
const pageSize = 20;

const { data } = useQuery({
  queryKey: ['paginated-data', page],
  queryFn: async () => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    return supabase
      .from('table')
      .select('*', { count: 'exact' })
      .range(from, to);
  }
});
```

#### ج. إضافة Cache
```typescript
// زيادة staleTime لتقليل الطلبات
const { data } = useQuery({
  queryKey: ['cached-data'],
  queryFn: fetchData,
  staleTime: 5 * 60 * 1000, // 5 دقائق
  gcTime: 10 * 60 * 1000,   // 10 دقائق
});
```

---

### المشكلة: re-renders كثيرة

**الأعراض:**
- تباطؤ في التفاعل
- استهلاك عالي للـ CPU

**التشخيص:**
```typescript
// استخدم React DevTools Profiler
// سجل التفاعلات وشاهد المكونات التي تعيد الرسم كثيراً
```

**الحل:**
```typescript
// استخدم useMemo للقيم المحسوبة
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// استخدم useCallback للدوال
const handleClick = useCallback(() => {
  doSomething(data);
}, [data]);

// استخدم React.memo للمكونات
export const MyComponent = React.memo(({ data }) => {
  return <div>{data.name}</div>;
});
```

---

## 🎨 مشاكل الواجهة

### المشكلة: مكون لا يظهر

**التشخيص:**
```bash
1. افتح React DevTools
2. ابحث عن المكون في شجرة المكونات
3. تحقق من props الممررة
4. تحقق من شروط الإظهار
```

**الأسباب الشائعة:**
```typescript
// السبب 1: شرط خاطئ
{data && <Component />}  // إذا كان data = []، لن يظهر!
{data?.length > 0 && <Component />}  // ✅ صحيح

// السبب 2: CSS يخفي المكون
<div className="hidden">...</div>  // ❌
<div className="opacity-0">...</div>  // ❌

// السبب 3: Loading لا ينتهي
{isLoading && <Spinner />}
{!isLoading && data && <Component />}  // ✅
```

---

### المشكلة: الألوان خاطئة

**السبب:**
استخدام ألوان مباشرة بدلاً من tokens

**الحل:**
```tsx
// ❌ خطأ
<div className="text-white bg-black">

// ✅ صحيح
<div className="text-foreground bg-background">

// ✅ استخدم semantic tokens
<div className="text-primary bg-secondary">
```

---

## 🔒 مشاكل RLS

### المشكلة: البيانات لا تظهر رغم وجودها

**التشخيص:**
```sql
-- 1. تحقق من وجود البيانات (كـ superuser)
SELECT * FROM table_name;

-- 2. تحقق من RLS policies
SELECT * FROM pg_policies WHERE tablename = 'table_name';

-- 3. اختبر السياسة
SET ROLE authenticated;
SET request.jwt.claims.sub = 'user-id';
SELECT * FROM table_name;
RESET ROLE;
```

**الحل:**
```sql
-- أضف أو عدل السياسة
CREATE POLICY "allow_read"
ON table_name
FOR SELECT
TO authenticated
USING (
  -- شرط الوصول
  user_id = auth.uid() 
  OR 
  has_role(auth.uid(), 'admin'::app_role)
);
```

---

### المشكلة: لا يمكن إضافة/تعديل بيانات

**السبب:**
سياسة RLS للـ INSERT أو UPDATE مفقودة أو خاطئة

**الحل:**
```sql
-- سياسة INSERT
CREATE POLICY "allow_insert"
ON table_name
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);

-- سياسة UPDATE
CREATE POLICY "allow_update"
ON table_name
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

---

## 🛠️ أدوات التشخيص

### 1. Console Browser
```javascript
// افتح Console (F12)
// اكتب هذه الأوامر

// تحقق من حالة المصادقة
console.log('User:', user);
console.log('Profile:', profile);

// تحقق من حالة البيانات
console.log('Data:', data);
console.log('Is Array:', Array.isArray(data));

// تحقق من الأخطاء
console.log('Error:', error);
```

### 2. React Query DevTools
```typescript
// في App.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />

// افتح DevTools أسفل الصفحة
// شاهد جميع الاستعلامات وحالاتها
```

### 3. Network Tab
```bash
# افتح Network tab (F12)
# فلتر على:
- XHR / Fetch: طلبات API
- انظر للحالة: 200 OK, 401 Unauthorized, etc
- انظر للوقت: كم يستغرق كل طلب
```

### 4. Postgres Logs
```sql
-- في Lovable Cloud Dashboard
-- Analytics -> Logs
-- ابحث عن:
- ERROR: أخطاء SQL
- SLOW QUERY: استعلامات بطيئة
- PERMISSION DENIED: مشاكل RLS
```

---

## 📞 الحصول على مساعدة

### قبل طلب المساعدة، اجمع:

1. **معلومات الخطأ:**
   - رسالة الخطأ الكاملة
   - Stack trace من Console
   - لقطة شاشة

2. **السياق:**
   - ماذا كنت تفعل؟
   - متى حدث الخطأ؟
   - هل يحدث دائماً أم أحياناً؟

3. **خطوات التكرار:**
   - الخطوات الدقيقة لتكرار المشكلة

4. **البيئة:**
   - المتصفح والإصدار
   - نظام التشغيل
   - حساب المستخدم ودوره

---

**آخر تحديث:** 26 نوفمبر 2024
**المساهمون:** فريق التطوير
