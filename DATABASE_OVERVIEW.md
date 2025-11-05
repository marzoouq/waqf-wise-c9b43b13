# نظرة عامة على قاعدة البيانات - نظام إدارة الوقف

## 📊 الإحصائيات العامة

- **عدد الجداول**: 22 جدول
- **نظام الأمان**: Row Level Security (RLS) مفعّل على جميع الجداول
- **نظام المصادقة**: Supabase Auth مع دعم إنشاء الحسابات التلقائي
- **نظام الصلاحيات**: Role-based access control (Admin/User)

---

## 🗂️ الجداول الرئيسية

### 1. **Authentication & Users** (المصادقة والمستخدمين)

#### `profiles` - ملفات المستخدمين
- **الوصف**: معلومات المستخدمين الإضافية
- **الحقول الرئيسية**:
  - `user_id` → يشير إلى `auth.users`
  - `full_name`, `email`, `phone`, `position`
  - `avatar_url`
- **RLS Policies**:
  - ✅ Authenticated users can read
  - ✅ Authenticated users can insert
  - ✅ Authenticated users can update
- **Trigger**: تُنشأ تلقائياً عند تسجيل مستخدم جديد

#### `user_roles` - صلاحيات المستخدمين
- **الوصف**: نظام الأدوار (Admin/User)
- **الحقول الرئيسية**:
  - `user_id` → يشير إلى `auth.users`
  - `role` → ENUM (admin, user)
- **RLS Policies**:
  - ✅ Users can view their own roles
  - ✅ Admins can view all roles
  - ✅ Admins can insert/update/delete roles
- **Security Function**: `has_role(user_id, role)` - للتحقق من الصلاحيات بشكل آمن

---

### 2. **Accounting** (المحاسبة)

#### `accounts` - دليل الحسابات
- **الوصف**: شجرة الحسابات المحاسبية
- **الحقول الرئيسية**:
  - `code`, `name_ar`, `name_en`
  - `account_type` → ENUM
  - `account_nature` → ENUM
  - `parent_id` → للحسابات الفرعية
  - `is_header` → حساب رئيسي أم فرعي
- **RLS Policies**:
  - ✅ Authenticated read/insert/update
  - ❌ No delete permission

#### `journal_entries` - القيود اليومية
- **الوصف**: قيود محاسبية
- **الحقول الرئيسية**:
  - `entry_number`, `entry_date`
  - `fiscal_year_id`, `status`
  - `reference_type`, `reference_id`
- **RLS Policies**:
  - ✅ Authenticated read/insert/update
  - ❌ No delete permission

#### `journal_entry_lines` - تفاصيل القيود
- **الوصف**: أسطر القيد المحاسبي
- **الحقول الرئيسية**:
  - `journal_entry_id`, `account_id`
  - `debit_amount`, `credit_amount`
  - `line_number`
- **RLS Policies**:
  - ✅ Authenticated read/insert/update
  - ❌ No delete permission

#### `fiscal_years` - السنوات المالية
- **الوصف**: إدارة السنوات المالية
- **الحقول الرئيسية**:
  - `name`, `start_date`, `end_date`
  - `is_active`, `is_closed`
- **RLS Policies**:
  - ✅ Authenticated read/insert/update
  - ❌ No delete permission

#### `budgets` - الموازنات
- **الوصف**: الموازنات التقديرية
- **الحقول الرئيسية**:
  - `fiscal_year_id`, `account_id`
  - `period_type`, `period_number`
  - `budgeted_amount`, `actual_amount`, `variance_amount`
- **RLS Policies**:
  - ✅ Authenticated read/insert/update
  - ❌ No delete permission

---

### 3. **Invoicing** (الفواتير)

#### `invoices` - الفواتير
- **الوصف**: فواتير البيع والشراء
- **الحقول الرئيسية**:
  - `invoice_number`, `invoice_date`
  - `customer_name`, `customer_email`, `customer_phone`
  - `subtotal`, `tax_amount`, `total_amount`
  - `status`, `journal_entry_id`
- **RLS Policies**:
  - ✅ Authenticated read/insert/update
  - ❌ No delete permission

#### `invoice_lines` - بنود الفواتير
- **الوصف**: تفاصيل بنود الفاتورة
- **الحقول الرئيسية**:
  - `invoice_id`, `account_id`
  - `quantity`, `unit_price`, `line_total`
  - `line_number`
- **RLS Policies**:
  - ✅ Authenticated read/insert/update
  - ❌ No delete permission

---

### 4. **Payments** (المدفوعات)

#### `payments` - المدفوعات
- **الوصف**: سندات القبض والصرف
- **الحقول الرئيسية**:
  - `payment_type` → (receipt/payment)
  - `payment_number`, `payment_date`
  - `payer_name`, `amount`
  - `payment_method`, `journal_entry_id`
- **RLS Policies**:
  - ✅ Authenticated read/insert/update/delete

---

### 5. **Approvals** (الموافقات)

#### `approvals` - الموافقات
- **الوصف**: سير عمل الموافقات
- **الحقول الرئيسية**:
  - `journal_entry_id`
  - `approver_name`, `status`
  - `approved_at`, `notes`
- **RLS Policies**:
  - ✅ Authenticated read/insert/update
  - ❌ No delete permission

---

### 6. **Beneficiaries & Funds** (المستفيدون والصناديق)

#### `beneficiaries` - المستفيدون
- **الوصف**: بيانات المستفيدين من الوقف
- **الحقول الرئيسية**:
  - `full_name`, `national_id`
  - `phone`, `email`
  - `category`, `status`
  - `family_name`, `relationship`
- **RLS Policies**:
  - ✅ Public read/insert/update/delete

#### `funds` - الصناديق
- **الوصف**: صناديق توزيع الأموال
- **الحقول الرئيسية**:
  - `name`, `category`
  - `allocated_amount`, `spent_amount`
  - `percentage`, `beneficiaries_count`
- **RLS Policies**:
  - ✅ Authenticated read/insert/update
  - ❌ No delete permission

#### `distributions` - التوزيعات
- **الوصف**: توزيعات الأموال الشهرية
- **الحقول الرئيسية**:
  - `month`, `distribution_date`
  - `total_amount`, `beneficiaries_count`
  - `status`, `notes`
- **RLS Policies**:
  - ✅ Public read/insert/update
  - ❌ No delete permission

---

### 7. **Properties** (العقارات)

#### `properties` - العقارات
- **الوصف**: عقارات الوقف
- **الحقول الرئيسية**:
  - `name`, `type`, `location`
  - `units`, `occupied`
  - `monthly_revenue`, `status`
- **RLS Policies**:
  - ✅ Public read/insert/update/delete

---

### 8. **Archive** (الأرشيف)

#### `documents` - المستندات
- **الوصف**: مستندات الأرشيف الإلكتروني
- **الحقول الرئيسية**:
  - `name`, `file_type`
  - `category`, `file_size`
  - `folder_id`, `uploaded_at`
- **RLS Policies**:
  - ✅ Public read/insert/update
  - ❌ No delete permission

#### `folders` - المجلدات
- **الوصف**: تنظيم المستندات
- **الحقول الرئيسية**:
  - `name`, `description`
  - `files_count`
- **RLS Policies**:
  - ✅ Public read/insert/update
  - ❌ No delete permission

---

### 9. **Activity Tracking** (تتبع النشاطات)

#### `activities` - السجل
- **الوصف**: سجل الأنشطة في النظام
- **الحقول الرئيسية**:
  - `user_name`, `action`
  - `timestamp`
- **RLS Policies**:
  - ✅ Authenticated read/insert
  - ❌ No update/delete permission

#### `tasks` - المهام
- **الوصف**: المهام المعلقة
- **الحقول الرئيسية**:
  - `task`, `priority`, `status`
- **RLS Policies**:
  - ✅ Authenticated read/insert/update
  - ❌ No delete permission

---

## 🔐 نظام الأمان (RLS Policies)

### أنماط الأمان المستخدمة:

1. **Authenticated Access** - الوصول للمستخدمين المسجلين فقط
   - معظم الجداول المحاسبية والإدارية

2. **Public Access** - الوصول العام (مؤقت للتطوير)
   - `beneficiaries`, `properties`, `distributions`, `documents`, `folders`
   - ⚠️ **يُنصح بتحديث هذه السياسات للإنتاج**

3. **Role-Based Access** - الوصول حسب الصلاحيات
   - `user_roles` - الأدمن فقط يمكنه التحكم بالصلاحيات

### Security Functions:

```sql
-- التحقق من صلاحية المستخدم
has_role(user_id UUID, role app_role) RETURNS BOOLEAN
```

---

## 🔄 Triggers & Functions

### 1. `handle_new_user()` Trigger
- **يُنفّذ عند**: إنشاء مستخدم جديد في `auth.users`
- **الوظيفة**:
  - إنشاء سجل في `profiles`
  - منح صلاحية `user` افتراضياً في `user_roles`

### 2. `update_updated_at_column()` Trigger
- **يُنفّذ على**: معظم الجداول
- **الوظيفة**: تحديث `updated_at` تلقائياً عند التعديل

---

## 📈 النمو والتوسع

### الجداول الجاهزة للاستخدام:
- ✅ Authentication & Profiles
- ✅ Archive (Documents & Folders)
- ✅ Activities & Tasks
- ✅ Accounting Structure

### الجداول التي تحتاج تفعيل CRUD:
- ⚠️ Beneficiaries - جاهزة لكن تحتاج واجهات كاملة
- ⚠️ Properties - جاهزة لكن تحتاج واجهات كاملة
- ⚠️ Funds & Distributions - جاهزة لكن تحتاج واجهات كاملة
- ⚠️ Invoices - جاهزة لكن تحتاج واجهات كاملة
- ⚠️ Payments - جاهزة لكن تحتاج واجهات كاملة

---

## 🚀 التحسينات المقترحة

### الأمان:
1. تحديث RLS policies لـ `public` tables لتصبح based on authentication
2. إضافة audit logs للعمليات الحساسة
3. تفعيل foreign key constraints بشكل كامل

### الأداء:
1. إضافة indexes على الحقول المستخدمة في البحث
2. تحسين queries المعقدة
3. إضافة materialized views للتقارير

### الوظائف:
1. إضافة soft delete بدلاً من hard delete
2. إضافة versioning للقيود المحاسبية
3. إضافة notification system
4. إضافة file upload integration لـ documents table

---

## 📝 ملاحظات مهمة

- ⚠️ **Auto-confirm email مفعّل** - مناسب للتطوير فقط
- ✅ **RLS مفعّل على جميع الجداول** - الأمان محمي
- ✅ **Triggers تعمل تلقائياً** - لا حاجة للتدخل اليدوي
- ⚠️ **بعض الجداول بـ public access** - تحتاج تحديث للإنتاج

---

**آخر تحديث**: 2024
**إصدار قاعدة البيانات**: 1.0
