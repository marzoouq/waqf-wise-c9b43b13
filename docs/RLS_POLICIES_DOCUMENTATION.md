# توثيق سياسات Row Level Security (RLS)

## 📖 نظرة عامة

**Row Level Security (RLS)** هو نظام أمان على مستوى قاعدة البيانات يتحكم في الوصول للبيانات على مستوى الصفوف (rows). في منصة Waqf Wise، نستخدم RLS لضمان أن كل مستخدم يرى ويعدل فقط البيانات المصرح له بها.

---

## 🎯 المفاهيم الأساسية

### ما هو RLS؟
RLS يسمح لك بتعريف سياسات (policies) تحدد:
- من يمكنه قراءة البيانات (SELECT)
- من يمكنه إضافة بيانات (INSERT)
- من يمكنه تحديث البيانات (UPDATE)
- من يمكنه حذف البيانات (DELETE)

### لماذا نستخدم RLS؟
1. **الأمان**: حماية البيانات الحساسة
2. **الخصوصية**: كل مستخدم يرى بياناته فقط
3. **التحكم في الصلاحيات**: إدارة دقيقة للصلاحيات
4. **الامتثال**: الالتزام بمعايير حماية البيانات

---

## 👥 الأدوار في النظام

### 1. **Admin** (مدير النظام)
- صلاحيات كاملة على جميع الجداول
- يمكنه إضافة وتعديل وحذف أي بيانات
- يمكنه إدارة المستخدمين والأدوار

### 2. **Nazer** (الناظر)
- صلاحيات كاملة على البيانات التشغيلية
- الموافقة على التوزيعات والمدفوعات
- عرض جميع التقارير

### 3. **Accountant** (المحاسب)
- إدارة القيود المحاسبية
- عرض وتعديل الحسابات
- إنشاء التقارير المالية
- لا يمكنه الموافقة النهائية

### 4. **Cashier** (أمين الصندوق)
- تنفيذ المدفوعات المعتمدة
- عرض سندات الصرف
- لا يمكنه إنشاء توزيعات جديدة

### 5. **Viewer** (مستعرض)
- عرض البيانات فقط
- لا يمكنه التعديل

### 6. **Beneficiary** (مستفيد)
- عرض بياناته الشخصية فقط
- تقديم طلبات
- عرض مدفوعاته

---

## 📋 سياسات الجداول الرئيسية

### 🙋 جدول `beneficiaries` (المستفيدون)

#### السياسات:

**1. عرض البيانات (SELECT)**
```sql
-- المستفيد يمكنه رؤية بياناته فقط
CREATE POLICY "Beneficiaries can view own data"
ON beneficiaries FOR SELECT
USING (auth.uid() = user_id);

-- الإداريون والمحاسبون يمكنهم رؤية جميع المستفيدين
CREATE POLICY "Staff can view all beneficiaries"
ON beneficiaries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant', 'viewer')
  )
);
```

**2. إضافة مستفيد جديد (INSERT)**
```sql
-- فقط الإداريون يمكنهم إضافة مستفيدين
CREATE POLICY "Only admins can insert beneficiaries"
ON beneficiaries FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer')
  )
);
```

**3. تحديث البيانات (UPDATE)**
```sql
-- المستفيد يمكنه تحديث بياناته فقط
CREATE POLICY "Beneficiaries can update own data"
ON beneficiaries FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- الإداريون يمكنهم تحديث أي بيانات
CREATE POLICY "Staff can update beneficiaries"
ON beneficiaries FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer')
  )
);
```

**4. حذف البيانات (DELETE)**
```sql
-- فقط Admin يمكنه الحذف
CREATE POLICY "Only admins can delete beneficiaries"
ON beneficiaries FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
```

---

### 💰 جدول `journal_entries` (القيود اليومية)

#### السياسات:

**1. عرض القيود (SELECT)**
```sql
-- المحاسبون والإداريون فقط
CREATE POLICY "Accounting staff can view journal entries"
ON journal_entries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant', 'viewer')
  )
);
```

**2. إضافة قيد (INSERT)**
```sql
-- المحاسبون فقط يمكنهم إنشاء قيود
CREATE POLICY "Accountants can create journal entries"
ON journal_entries FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'accountant')
  )
);
```

**3. تحديث القيد (UPDATE)**
```sql
-- فقط القيود غير المعتمدة يمكن تعديلها
CREATE POLICY "Accountants can update unposted entries"
ON journal_entries FOR UPDATE
USING (
  status = 'draft'
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'accountant')
  )
);
```

**4. حذف القيد (DELETE)**
```sql
-- فقط القيود المسودة يمكن حذفها
CREATE POLICY "Accountants can delete draft entries"
ON journal_entries FOR DELETE
USING (
  status = 'draft'
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'accountant')
  )
);
```

---

### 🏢 جدول `properties` (العقارات)

#### السياسات:

**1. عرض العقارات (SELECT)**
```sql
-- جميع الموظفين يمكنهم عرض العقارات
CREATE POLICY "Staff can view properties"
ON properties FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant', 'viewer')
  )
);
```

**2. إضافة عقار (INSERT)**
```sql
-- الإداريون فقط
CREATE POLICY "Admins can add properties"
ON properties FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer')
  )
);
```

**3. تحديث عقار (UPDATE)**
```sql
-- الإداريون فقط
CREATE POLICY "Admins can update properties"
ON properties FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer')
  )
);
```

---

### 💵 جدول `distributions` (التوزيعات)

#### السياسات:

**1. عرض التوزيعات (SELECT)**
```sql
-- الموظفون يمكنهم رؤية جميع التوزيعات
CREATE POLICY "Staff can view distributions"
ON distributions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant', 'cashier', 'viewer')
  )
);

-- المستفيدون يمكنهم رؤية توزيعاتهم فقط
CREATE POLICY "Beneficiaries can view own distributions"
ON distributions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM distribution_details
    WHERE distribution_id = distributions.id
    AND beneficiary_id IN (
      SELECT id FROM beneficiaries WHERE user_id = auth.uid()
    )
  )
);
```

**2. إنشاء توزيع (INSERT)**
```sql
-- الناظر والإداريون فقط
CREATE POLICY "Authorized staff can create distributions"
ON distributions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer')
  )
);
```

**3. الموافقة على التوزيع (UPDATE)**
```sql
-- الناظر فقط يمكنه الموافقة
CREATE POLICY "Nazer can approve distributions"
ON distributions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer')
  )
);
```

---

### 📝 جدول `beneficiary_requests` (طلبات المستفيدين)

#### السياسات:

**1. عرض الطلبات (SELECT)**
```sql
-- المستفيد يرى طلباته فقط
CREATE POLICY "Beneficiaries can view own requests"
ON beneficiary_requests FOR SELECT
USING (
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
);

-- الموظفون يرون جميع الطلبات
CREATE POLICY "Staff can view all requests"
ON beneficiary_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant', 'viewer')
  )
);
```

**2. تقديم طلب (INSERT)**
```sql
-- المستفيد يمكنه تقديم طلب
CREATE POLICY "Beneficiaries can create requests"
ON beneficiary_requests FOR INSERT
WITH CHECK (
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
);
```

**3. تحديث الطلب (UPDATE)**
```sql
-- المستفيد يمكنه تحديث طلباته المعلقة فقط
CREATE POLICY "Beneficiaries can update pending requests"
ON beneficiary_requests FOR UPDATE
USING (
  status = 'pending'
  AND beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
);

-- الموظفون يمكنهم تحديث أي طلب
CREATE POLICY "Staff can update requests"
ON beneficiary_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer')
  )
);
```

---

### 📊 جدول `audit_logs` (سجل التدقيق)

#### السياسات:

**1. عرض السجلات (SELECT)**
```sql
-- الإداريون فقط
CREATE POLICY "Only admins can view audit logs"
ON audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
```

**2. إضافة سجل (INSERT)**
```sql
-- النظام فقط (service_role)
-- لا يوجد policy للمستخدمين العاديين
```

**3. لا يمكن التحديث أو الحذف**
```sql
-- سجل التدقيق للقراءة فقط
-- لا توجد policies للـ UPDATE أو DELETE
```

---

## 🔧 كيفية إضافة سياسة جديدة

### الخطوات:

#### 1. تحديد المتطلبات
- من يحتاج الوصول؟
- ما نوع العملية (SELECT, INSERT, UPDATE, DELETE)?
- ما الشروط المطلوبة؟

#### 2. كتابة السياسة
```sql
-- مثال: إضافة سياسة لجدول جديد
CREATE POLICY "policy_name"
ON table_name
FOR operation  -- SELECT, INSERT, UPDATE, DELETE
USING (condition)  -- شرط العرض
WITH CHECK (condition);  -- شرط التعديل
```

#### 3. اختبار السياسة
```sql
-- تسجيل الدخول كمستخدم مختلف
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'user-id-here';

-- اختبر الاستعلام
SELECT * FROM table_name;
```

#### 4. التوثيق
- أضف السياسة إلى هذا الملف
- أضف تعليقات في migration file

---

## 🛡️ أمثلة متقدمة

### 1. سياسة مع شروط متعددة
```sql
-- المستفيد يرى بياناته إذا كان نشطاً
CREATE POLICY "Active beneficiaries only"
ON beneficiaries FOR SELECT
USING (
  auth.uid() = user_id
  AND status = 'active'
  AND verified_at IS NOT NULL
);
```

### 2. سياسة مع join
```sql
-- المستفيد يرى توزيعاته المعتمدة فقط
CREATE POLICY "Approved distributions only"
ON distribution_details FOR SELECT
USING (
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM distributions
    WHERE id = distribution_details.distribution_id
    AND status = 'approved'
  )
);
```

### 3. سياسة بناءً على الوقت
```sql
-- يمكن تعديل الطلب خلال 24 ساعة من التقديم
CREATE POLICY "Edit within 24 hours"
ON beneficiary_requests FOR UPDATE
USING (
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
  AND created_at > NOW() - INTERVAL '24 hours'
  AND status = 'pending'
);
```

---

## 🐛 استكشاف أخطاء RLS

### مشاكل شائعة:

#### 1. **"new row violates row-level security policy"**
**السبب**: محاولة إدراج/تحديث بيانات غير مصرح بها.

**الحل**:
```sql
-- تحقق من سياسات INSERT/UPDATE
SELECT * FROM pg_policies 
WHERE tablename = 'your_table_name';

-- تحقق من دور المستخدم
SELECT role FROM user_roles WHERE user_id = auth.uid();
```

#### 2. **لا يمكن رؤية البيانات**
**السبب**: سياسة SELECT مقيدة.

**الحل**:
```sql
-- اختبر السياسة
EXPLAIN (ANALYZE, VERBOSE)
SELECT * FROM table_name;

-- تحقق من auth.uid()
SELECT auth.uid();
```

#### 3. **الأداء البطيء**
**السبب**: سياسات معقدة أو بدون فهرسة.

**الحل**:
```sql
-- أضف فهارس للأعمدة المستخدمة في السياسات
CREATE INDEX idx_beneficiaries_user_id 
ON beneficiaries(user_id);

-- استخدم EXPLAIN لتحليل الأداء
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM table_name;
```

---

## 📋 قائمة تحقق الأمان

عند إنشاء جدول جديد:

- [ ] تفعيل RLS على الجدول
  ```sql
  ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
  ```

- [ ] إنشاء سياسة SELECT
- [ ] إنشاء سياسة INSERT (إذا لزم)
- [ ] إنشاء سياسة UPDATE (إذا لزم)
- [ ] إنشاء سياسة DELETE (إذا لزم)
- [ ] اختبار السياسات مع أدوار مختلفة
- [ ] إضافة فهارس للأداء
- [ ] توثيق السياسات

---

## 🔍 أدوات مفيدة

### عرض جميع السياسات:
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### عرض الجداول المحمية بـ RLS:
```sql
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;
```

### فحص صلاحيات المستخدم:
```sql
-- من داخل Supabase
SELECT auth.uid() as current_user_id;

SELECT * FROM user_roles 
WHERE user_id = auth.uid();
```

---

## 📚 مراجع إضافية

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [البنية المعمارية](./ARCHITECTURE.md)
- [دليل المطور](./DEVELOPER_GUIDE.md)

---

## ⚠️ ملاحظات هامة

1. **لا تعطل RLS أبداً** على الجداول التي تحتوي بيانات حساسة
2. **اختبر دائماً** السياسات مع أدوار مختلفة
3. **راقب الأداء** - السياسات المعقدة قد تؤثر على السرعة
4. **وثّق كل سياسة** - اشرح السبب والاستخدام
5. **استخدم service_role بحذر** - تجاوز RLS خطير

---

**آخر تحديث**: 2025
**الإصدار**: 1.0.0
