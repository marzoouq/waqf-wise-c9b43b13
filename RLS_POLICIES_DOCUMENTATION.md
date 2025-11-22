# 📋 توثيق سياسات Row Level Security (RLS)

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![RLS Policies](https://img.shields.io/badge/RLS_Policies-112+-green.svg)
![Protected Policies](https://img.shields.io/badge/محمية-16-red.svg)

**🔐 دليل شامل لسياسات الأمان على مستوى الصفوف**

</div>

---

## 📋 جدول المحتويات

1. [نظرة عامة](#-نظرة-عامة)
2. [السياسات المحمية](#-السياسات-المحمية-لا-تُعدّل)
3. [السياسات القياسية](#-السياسات-القياسية-قابلة-للتعديل)
4. [دليل إنشاء سياسات جديدة](#-دليل-إنشاء-سياسات-جديدة)
5. [أفضل الممارسات](#-أفضل-الممارسات)
6. [استكشاف الأخطاء](#-استكشاف-الأخطاء-وإصلاحها)

---

## 🎯 نظرة عامة

### ما هي RLS Policies؟

Row Level Security (RLS) هي ميزة في PostgreSQL تسمح بالتحكم في الوصول إلى صفوف محددة في الجداول بناءً على المستخدم الحالي.

### الإحصائيات

```
📊 إجمالي الجداول المحمية: 112+ جدول
🔒 السياسات المحمية: 16 سياسة
👥 الأدوار المدعومة: 7 أدوار (nazer, admin, accountant, cashier, archivist, beneficiary, user)
```

---

## 🔐 السياسات المحمية (لا تُعدّل)

### ⚠️ تحذير حرج

السياسات التالية محمية بـ **Event Trigger** ولا يمكن حذفها أو تعديلها بدون موافقة الناظر:

---

### 1️⃣ المحاسبة والبيانات المالية

#### A) جدول `accounts` - الحسابات المحاسبية

**السياسة المحمية:**
```sql
CREATE POLICY "first_degree_read"
ON public.accounts FOR SELECT
TO authenticated
USING (
  is_first_degree_beneficiary(auth.uid()) OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);
```

**الوصف:**
- **الهدف:** السماح للمستفيدين من الدرجة الأولى بالاطلاع على شجرة الحسابات كاملة
- **مستوى الحماية:** 🔴 Critical
- **الصلاحيات:** قراءة فقط
- **المستخدمون:** المستفيدون الـ14 + Admin + Nazer + Accountant

---

#### B) جدول `journal_entries` - القيود اليومية

**السياسة المحمية:**
```sql
CREATE POLICY "first_degree_read"
ON public.journal_entries FOR SELECT
TO authenticated
USING (
  is_first_degree_beneficiary(auth.uid()) OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);
```

**الوصف:**
- **الهدف:** شفافية كاملة في القيود المحاسبية
- **مستوى الحماية:** 🔴 Critical
- **الصلاحيات:** قراءة فقط
- **المستخدمون:** المستفيدون الـ14 + Admin + Nazer + Accountant

---

#### C) جدول `budgets` - الميزانيات

**السياسة المحمية:**
```sql
CREATE POLICY "first_degree_read"
ON public.budgets FOR SELECT
TO authenticated
USING (
  is_first_degree_beneficiary(auth.uid()) OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);
```

**الوصف:**
- **الهدف:** الاطلاع على الميزانيات المعتمدة
- **مستوى الحماية:** 🔴 Critical
- **الصلاحيات:** قراءة فقط

---

#### D) جدول `cash_flows` - التدفقات النقدية

**السياسة المحمية:**
```sql
CREATE POLICY "first_degree_read"
ON public.cash_flows FOR SELECT
TO authenticated
USING (
  is_first_degree_beneficiary(auth.uid()) OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);
```

**الوصف:**
- **الهدف:** شفافية التدفقات النقدية
- **مستوى الحماية:** 🔴 Critical

---

#### E) جدول `fiscal_years` - السنوات المالية

**السياسة المحمية:**
```sql
CREATE POLICY "first_degree_read"
ON public.fiscal_years FOR SELECT
TO authenticated
USING (
  is_first_degree_beneficiary(auth.uid()) OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);
```

**الوصف:**
- **الهدف:** الاطلاع على السنوات المالية وحالاتها
- **مستوى الحماية:** 🔴 Critical

---

### 2️⃣ البيانات البنكية

#### A) جدول `bank_accounts` - الحسابات البنكية

**السياسة المحمية:**
```sql
CREATE POLICY "first_degree_read"
ON public.bank_accounts FOR SELECT
TO authenticated
USING (
  is_first_degree_beneficiary(auth.uid()) OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);
```

**الوصف:**
- **الهدف:** شفافية في الحسابات البنكية للوقف
- **مستوى الحماية:** 🔴 Critical

---

#### B) جدول `bank_statements` - كشوفات البنك

**السياسة المحمية:**
```sql
CREATE POLICY "first_degree_read"
ON public.bank_statements FOR SELECT
TO authenticated
USING (
  is_first_degree_beneficiary(auth.uid()) OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);
```

**الوصف:**
- **الهدف:** الاطلاع على كشوفات البنوك
- **مستوى الحماية:** 🔴 Critical

---

#### C) جدول `bank_transactions` - المعاملات البنكية

**السياسة المحمية:**
```sql
CREATE POLICY "first_degree_read"
ON public.bank_transactions FOR SELECT
TO authenticated
USING (
  is_first_degree_beneficiary(auth.uid()) OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);
```

**الوصف:**
- **الهدف:** شفافية المعاملات البنكية
- **مستوى الحماية:** 🔴 Critical

---

### 3️⃣ العقارات والعقود

#### A) جدول `properties` - العقارات

**السياسة المحمية:**
```sql
CREATE POLICY "first_degree_read"
ON public.properties FOR SELECT
TO authenticated
USING (
  is_first_degree_beneficiary(auth.uid()) OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);
```

**الوصف:**
- **الهدف:** الاطلاع على العقارات التابعة للوقف
- **مستوى الحماية:** 🔴 Critical

---

#### B) جدول `contracts` - العقود

**السياسة المحمية:**
```sql
CREATE POLICY "first_degree_read"
ON public.contracts FOR SELECT
TO authenticated
USING (
  is_first_degree_beneficiary(auth.uid()) OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);
```

**الوصف:**
- **الهدف:** شفافية في عقود الإيجار
- **مستوى الحماية:** 🔴 Critical

---

#### C) جدول `rental_payments` - مدفوعات الإيجار

**السياسة المحمية:**
```sql
CREATE POLICY "first_degree_read"
ON public.rental_payments FOR SELECT
TO authenticated
USING (
  is_first_degree_beneficiary(auth.uid()) OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);
```

**الوصف:**
- **الهدف:** متابعة دفعات الإيجار
- **مستوى الحماية:** 🔴 Critical

---

### 4️⃣ التوزيعات والصناديق

#### A) جدول `distributions` - التوزيعات

**السياسة المحمية:**
```sql
CREATE POLICY "first_degree_read"
ON public.distributions FOR SELECT
TO authenticated
USING (
  (is_first_degree_beneficiary(auth.uid()) AND status = 'معتمد') OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);
```

**الوصف:**
- **الهدف:** الاطلاع على التوزيعات المعتمدة فقط
- **مستوى الحماية:** 🔴 Critical
- **ملاحظة:** المستفيدون يرون المعتمد فقط

---

#### B) جدول `funds` - الصناديق

**السياسة المحمية:**
```sql
CREATE POLICY "first_degree_read"
ON public.funds FOR SELECT
TO authenticated
USING (
  (is_first_degree_beneficiary(auth.uid()) AND is_active = true) OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);
```

**الوصف:**
- **الهدف:** الاطلاع على الصناديق النشطة
- **مستوى الحماية:** 🔴 Critical

---

#### C) جدول `waqf_distribution_settings` - إعدادات التوزيع

**السياسة المحمية:**
```sql
CREATE POLICY "first_degree_read"
ON public.waqf_distribution_settings FOR SELECT
TO authenticated
USING (
  (is_first_degree_beneficiary(auth.uid()) AND is_active = true) OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);
```

**الوصف:**
- **الهدف:** الاطلاع على إعدادات توزيع الغلة
- **مستوى الحماية:** 🔴 Critical

---

### 5️⃣ الحوكمة والشفافية

#### A) جدول `governance_decisions` - قرارات الحوكمة

**السياسة المحمية:**
```sql
CREATE POLICY "first_degree_read"
ON public.governance_decisions FOR SELECT
TO authenticated
USING (
  (is_first_degree_beneficiary(auth.uid()) AND 
   status IN ('موافق عليه', 'قيد التنفيذ', 'مكتمل')) OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);
```

**الوصف:**
- **الهدف:** شفافية في قرارات الحوكمة
- **مستوى الحماية:** 🔴 Critical

---

#### B) جدول `waqf_nazers` - معلومات الناظر

**السياسة المحمية:**
```sql
CREATE POLICY "first_degree_read_nazers"
ON public.waqf_nazers FOR SELECT
TO authenticated
USING (
  is_first_degree_beneficiary(auth.uid()) OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);
```

**الوصف:**
- **الهدف:** شفافية في بيانات الناظر
- **مستوى الحماية:** 🔴 Critical

---

## 🔧 السياسات القياسية (قابلة للتعديل)

### 1️⃣ جدول `performance_metrics` - مقاييس الأداء

**السياسة الحالية:**
```sql
CREATE POLICY "admin_nazer_accountant_read_metrics"
ON public.performance_metrics FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);
```

**الوصف:**
- **الهدف:** حماية بيانات الأداء الحساسة
- **مستوى الحماية:** 🟡 High
- **قابل للتعديل:** نعم (بإذن الناظر)

---

### 2️⃣ جدول `auto_fix_attempts` - محاولات الإصلاح التلقائي

**السياسة الحالية:**
```sql
CREATE POLICY "admin_only_view_autofix"
ON public.auto_fix_attempts FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));
```

**الوصف:**
- **الهدف:** حماية استراتيجيات معالجة الأخطاء
- **مستوى الحماية:** 🟡 High
- **قابل للتعديل:** نعم

---

### 3️⃣ جدول `alert_rules` - قواعد التنبيهات

**السياسة الحالية:**
```sql
CREATE POLICY "admin_only_view_alert_rules"
ON public.alert_rules FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));
```

**الوصف:**
- **الهدف:** حماية قواعد التنبيهات الأمنية
- **مستوى الحماية:** 🟡 High
- **قابل للتعديل:** نعم

---

### 4️⃣ جدول `tasks` - المهام

**السياسة الحالية:**
```sql
CREATE POLICY "staff_only_view_tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant') OR
  has_role(auth.uid(), 'cashier')
);
```

**الوصف:**
- **الهدف:** المهام الداخلية للموظفين فقط
- **مستوى الحماية:** 🟢 Medium
- **قابل للتعديل:** نعم

---

## 📝 دليل إنشاء سياسات جديدة

### خطوات إنشاء سياسة جديدة

#### 1. تحديد الهدف

قبل إنشاء سياسة جديدة، اسأل:
- من يحتاج الوصول؟
- ما نوع الوصول (قراءة، كتابة، تعديل، حذف)؟
- هل هناك شروط خاصة؟

#### 2. اختيار النمط المناسب

**A) سياسة بسيطة - حسب الدور:**
```sql
CREATE POLICY "role_based_read"
ON table_name FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'role_name'));
```

**B) سياسة معقدة - شروط متعددة:**
```sql
CREATE POLICY "complex_read"
ON table_name FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR
  (has_role(auth.uid(), 'user') AND column_name = auth.uid())
);
```

**C) سياسة محمية للمستفيدين من الدرجة الأولى:**
```sql
CREATE POLICY "first_degree_read"
ON table_name FOR SELECT
TO authenticated
USING (
  is_first_degree_beneficiary(auth.uid()) OR
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'nazer')
);
```

#### 3. إضافة السياسة للتوثيق

إذا كانت السياسة **محمية** (تخص المستفيدين من الدرجة الأولى):
```sql
INSERT INTO public.protected_policies_log 
  (table_name, policy_name, policy_description, protection_level)
VALUES 
  ('table_name', 'policy_name', 'وصف السياسة', 'critical');
```

#### 4. الاختبار

```sql
-- تسجيل الدخول كمستخدم عادي
SET ROLE authenticated;
SET request.jwt.claim.sub TO 'user_uuid';

-- محاولة قراءة البيانات
SELECT * FROM table_name;

-- إعادة الصلاحيات
RESET ROLE;
```

---

## ✅ أفضل الممارسات

### 1. التسمية الموحدة

استخدم نظام تسمية واضح:
```
[target_role]_[operation]_[optional_condition]

أمثلة:
- admin_only_read
- beneficiary_own_data
- first_degree_read
- staff_write_approved
```

### 2. التوثيق

أضف تعليقات لكل سياسة:
```sql
COMMENT ON POLICY "policy_name" ON table_name IS 
'وصف واضح للسياسة وهدفها والمستخدمين المستهدفين';
```

### 3. الاختبار المستمر

- ✅ اختبر السياسة بعد إنشائها
- ✅ اختبر من حسابات مختلفة
- ✅ راجع السياسات دورياً

### 4. الأمان أولاً

- 🔒 ابدأ محدوداً ثم وسّع
- 🔒 لا تفتح الوصول للجميع
- 🔒 راجع البيانات الحساسة

---

## 🔍 استكشاف الأخطاء وإصلاحها

### مشكلة: لا يمكن رؤية البيانات

**الأعراض:**
```sql
SELECT * FROM table_name;
-- نتيجة: 0 rows
```

**الحلول:**
1. تحقق من وجود RLS على الجدول:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'table_name';
```

2. عرض السياسات الحالية:
```sql
SELECT * FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'table_name';
```

3. التحقق من الدور الحالي:
```sql
SELECT auth.uid();
SELECT role FROM user_roles WHERE user_id = auth.uid();
```

---

### مشكلة: خطأ "محمية من الحذف"

**الأعراض:**
```
ERROR: لا يمكن حذف سياسة محمية تخص المستفيدين من الدرجة الأولى
```

**السبب:**
- السياسة محمية بـ Event Trigger
- تحتوي على `first_degree` أو `الفئة الأولى`

**الحل:**
1. راجع [ملف حقوق المستفيدين](./BENEFICIARY_RIGHTS.md)
2. إذا كان التعديل ضرورياً:
   - احصل على موافقة الناظر
   - وثق السبب
   - عدّل السياسة بدلاً من حذفها

---

### مشكلة: أداء بطيء

**الأعراض:**
```sql
SELECT * FROM table_name WHERE condition;
-- يستغرق وقتاً طويلاً
```

**الحلول:**
1. أضف indexes على الأعمدة المستخدمة في الشروط:
```sql
CREATE INDEX idx_table_column 
ON table_name(column_name);
```

2. استخدم `EXPLAIN ANALYZE` للتحليل:
```sql
EXPLAIN ANALYZE
SELECT * FROM table_name WHERE condition;
```

---

## 📊 إحصائيات السياسات

### حسب مستوى الحماية

```
🔴 Critical: 16 سياسة (محمية)
🟡 High: 4 سياسات
🟢 Medium: 92+ سياسة
```

### حسب الجدول

**أعلى 5 جداول بعدد السياسات:**
1. `contracts` - 12 سياسة
2. `distributions` - 11 سياسة
3. `tasks` - 9 سياسات
4. `journal_entries` - 8 سياسات
5. `rental_payments` - 8 سياسات

---

## 🔗 روابط مفيدة

- [حقوق المستفيدين من الدرجة الأولى](./BENEFICIARY_RIGHTS.md)
- [تقرير التدقيق الأمني](./COMPREHENSIVE_AUDIT_REPORT.md)
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

<div align="center">

**🔐 الأمان والشفافية معاً**

**📅 آخر تحديث:** 2025-11-22  
**📝 الإصدار:** 1.0.0  
**✅ الحالة:** موثّق ومطبّق

</div>