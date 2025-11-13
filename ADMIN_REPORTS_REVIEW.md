# تقرير تقييم شامل: الإدارة والتقارير والأرشيف وسجل العمليات

## 📅 تاريخ التقييم: 13 نوفمبر 2025

---

## 📊 ملخص تنفيذي

| القسم | التقييم | الحالة | المشاكل الرئيسية |
|-------|---------|---------|------------------|
| **الإدارة (Settings)** | 75/100 | 🟡 جيد | نقص في إعدادات النظام المتقدمة |
| **التقارير (Reports)** | 82/100 | 🟢 ممتاز | تحتاج views materializd مفقودة |
| **الأرشيف (Archive)** | 88/100 | 🟢 ممتاز | يعمل بشكل جيد |
| **سجل العمليات (Audit Logs)** | 60/100 | 🔴 يحتاج تطوير | الجدول غير موجود في قاعدة البيانات |

---

## 1️⃣ الإدارة (Settings) - التقييم: 75/100

### ✅ **ما يعمل بشكل جيد:**
- واجهة مستخدم نظيفة ومنظمة
- 6 أقسام إعدادات رئيسية
- Dialogs منظمة لكل قسم (Profile, Notifications, Security, Database, Appearance, Language)
- تصميم responsive ممتاز

### ❌ **المشاكل الحرجة:**
1. **جدول `system_settings` غير موجود** - يؤثر على:
   - `useSystemSettings` hook
   - `payment_approval_threshold`
   - إعدادات النظام العامة

2. **نقص في الوظائف:**
   - لا توجد إعدادات للتحكم في حدود الموافقات
   - لا توجد إدارة للعملة والمناطق الزمنية
   - لا توجد إعدادات للتقارير الافتراضية

### 🎯 **التحسينات المقترحة:**

#### أولوية عالية:
1. **إنشاء جدول system_settings**:
```sql
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type TEXT DEFAULT 'string', -- string, number, boolean, json
  description TEXT,
  category TEXT, -- general, financial, notifications, security
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

2. **إضافة إعدادات افتراضية**:
```sql
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description, category) VALUES
('payment_approval_threshold', '50000', 'number', 'حد المبلغ الذي يتطلب موافقة للمدفوعات', 'financial'),
('default_currency', 'SAR', 'string', 'العملة الافتراضية', 'general'),
('default_timezone', 'Asia/Riyadh', 'string', 'المنطقة الزمنية الافتراضية', 'general'),
('notification_email_enabled', 'true', 'boolean', 'تفعيل إشعارات البريد الإلكتروني', 'notifications'),
('notification_sms_enabled', 'false', 'boolean', 'تفعيل إشعارات الرسائل النصية', 'notifications'),
('max_file_upload_size', '10485760', 'number', 'الحد الأقصى لحجم الملف (بالبايت)', 'general'),
('session_timeout_minutes', '120', 'number', 'مدة انتهاء الجلسة (بالدقائق)', 'security'),
('password_min_length', '8', 'number', 'الحد الأدنى لطول كلمة المرور', 'security'),
('auto_backup_enabled', 'true', 'boolean', 'تفعيل النسخ الاحتياطي التلقائي', 'general'),
('backup_retention_days', '30', 'number', 'مدة الاحتفاظ بالنسخ الاحتياطية (بالأيام)', 'general');
```

#### أولوية متوسطة:
3. **إضافة صفحة إعدادات النظام المتقدمة**:
   - SystemSettingsDialog.tsx لإدارة الإعدادات العامة
   - FinancialSettingsDialog.tsx لإعدادات المالية المتقدمة

---

## 2️⃣ التقارير (Reports) - التقييم: 82/100

### ✅ **ما يعمل بشكل ممتاز:**
- 6 تقارير رئيسية متكاملة:
  - ميزان المراجعة (Trial Balance)
  - الميزانية العمومية (Balance Sheet)
  - قائمة الدخل (Income Statement)
  - التدفقات النقدية (Cash Flow)
  - الربط المحاسبي (Accounting Link)
  - التوزيعات (Distributions)
- تصدير PDF و Excel
- تقرير المتأخرات (OverdueReport) جديد وشامل
- واجهة مستخدم ممتازة

### ⚠️ **المشاكل:**
1. **Materialized Views مفقودة**:
   - `mv_financial_summary` - غير موجود
   - `mv_loan_statistics` - غير موجود
   - هذا يعني أن التقارير المتقدمة لن تستخدم البيانات المُحسّنة

2. **نقص في التقارير المتقدمة**:
   - لا يوجد تقرير لتحليل الأداء المالي
   - لا يوجد تقرير مقارنة سنوية/شهرية
   - لا يوجد تقرير KPIs

### 🎯 **التحسينات المقترحة:**

#### أولوية عالية:
1. **إنشاء Materialized Views**:
```sql
-- ملخص مالي شامل
CREATE MATERIALIZED VIEW public.mv_financial_summary AS
SELECT 
  DATE_TRUNC('month', je.entry_date) as month,
  acc.account_type,
  SUM(CASE WHEN jei.debit > 0 THEN jei.debit ELSE 0 END) as total_debit,
  SUM(CASE WHEN jei.credit > 0 THEN jei.credit ELSE 0 END) as total_credit,
  COUNT(DISTINCT je.id) as entry_count
FROM journal_entries je
JOIN journal_entry_items jei ON je.id = jei.entry_id
JOIN accounts acc ON jei.account_id = acc.id
WHERE je.status = 'approved'
GROUP BY DATE_TRUNC('month', je.entry_date), acc.account_type;

-- إحصائيات القروض
CREATE MATERIALIZED VIEW public.mv_loan_statistics AS
SELECT 
  l.status,
  COUNT(*) as loan_count,
  SUM(l.principal_amount) as total_principal,
  SUM(l.remaining_amount) as total_remaining,
  AVG(l.term_months) as avg_term_months,
  COUNT(DISTINCT l.beneficiary_id) as unique_beneficiaries
FROM loans l
GROUP BY l.status;

-- دالة تحديث الـ views
CREATE OR REPLACE FUNCTION public.refresh_financial_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW mv_financial_summary;
  REFRESH MATERIALIZED VIEW mv_loan_statistics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

2. **إضافة تقارير تحليلية جديدة**:
   - FinancialKPIsReport.tsx - مؤشرات الأداء الرئيسية
   - ComparativeReport.tsx - تقارير مقارنة (شهري/سنوي)
   - BeneficiaryAnalyticsReport.tsx - تحليل المستفيدين

#### أولوية متوسطة:
3. **تحسين تصدير التقارير**:
   - دعم تصدير متعدد (PDF + Excel معاً)
   - إضافة شعار الوقف في التقارير المصدرة
   - تحسين تنسيق PDF العربي

---

## 3️⃣ الأرشيف (Archive) - التقييم: 88/100

### ✅ **ما يعمل بشكل ممتاز:**
- نظام مجلدات ومستندات متكامل
- إحصائيات شاملة (مستندات، مجلدات، حجم التخزين)
- بحث متقدم بفلاتر
- رفع وتحميل الملفات
- واجهة مستخدم ممتازة ومرنة
- تصميم responsive ممتاز

### ⚠️ **المشاكل البسيطة:**
1. **نقص في الوظائف المتقدمة**:
   - لا يوجد OCR لاستخراج النص من المستندات
   - لا يوجد نظام تصنيف تلقائي
   - لا توجد سياسات احتفاظ (Retention Policies)

2. **نقص في الأمان**:
   - لا يوجد نظام تشفير للملفات الحساسة
   - لا يوجد تتبع لمن قام بالوصول للملفات

### 🎯 **التحسينات المقترحة:**

#### أولوية متوسطة:
1. **إضافة Document Versions**:
```sql
CREATE TABLE public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  change_notes TEXT
);
```

2. **إضافة Document Access Log**:
```sql
CREATE TABLE public.document_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT, -- view, download, edit, delete
  ip_address TEXT,
  accessed_at TIMESTAMPTZ DEFAULT now()
);
```

#### أولوية منخفضة:
3. **تحسينات مستقبلية**:
   - إضافة OCR باستخدام Lovable AI
   - تصنيف تلقائي للمستندات
   - معاينة الملفات داخل النظام

---

## 4️⃣ سجل العمليات (Audit Logs) - التقييم: 60/100

### ❌ **المشكلة الحرجة:**
**جدول `audit_logs` غير موجود في قاعدة البيانات!**

هذا يعني أن:
- صفحة Audit Logs لن تعمل
- `useAuditLogs` hook سيفشل
- لا يوجد تتبع للعمليات الحرجة في النظام

### ✅ **ما موجود في الكود:**
- واجهة مستخدم ممتازة جاهزة
- فلاتر متقدمة (نوع العملية، الجدول، الخطورة، التاريخ)
- عرض بيانات منظم وسهل القراءة
- تصميم responsive

### 🎯 **الحل الفوري (أولوية قصوى):**

**إنشاء جدول audit_logs متكامل**:
```sql
-- جدول سجل العمليات
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  action_type TEXT NOT NULL, -- INSERT, UPDATE, DELETE, LOGIN, LOGOUT, APPROVE, REJECT
  table_name TEXT, -- اسم الجدول المتأثر
  record_id UUID, -- معرف السجل المتأثر
  old_data JSONB, -- البيانات القديمة
  new_data JSONB, -- البيانات الجديدة
  changes JSONB, -- التغييرات فقط
  severity TEXT DEFAULT 'info', -- info, warning, error, critical
  ip_address TEXT,
  user_agent TEXT,
  description TEXT,
  metadata JSONB, -- بيانات إضافية
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes للأداء
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);

-- RLS Policies
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "المسؤولون يمكنهم رؤية كل السجلات"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'nazer')
    )
  );

CREATE POLICY "المستخدمون يمكنهم رؤية سجلاتهم فقط"
  ON public.audit_logs FOR SELECT
  USING (user_id = auth.uid());

-- دالة لإنشاء سجل تلقائياً
CREATE OR REPLACE FUNCTION public.create_audit_log(
  p_action_type TEXT,
  p_table_name TEXT,
  p_record_id UUID,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL,
  p_severity TEXT DEFAULT 'info',
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_user_email TEXT;
BEGIN
  -- الحصول على بريد المستخدم
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = auth.uid();

  -- إنشاء السجل
  INSERT INTO public.audit_logs (
    user_id,
    user_email,
    action_type,
    table_name,
    record_id,
    old_data,
    new_data,
    severity,
    description
  ) VALUES (
    auth.uid(),
    v_user_email,
    p_action_type,
    p_table_name,
    p_record_id,
    p_old_data,
    p_new_data,
    p_severity,
    p_description
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger للعمليات الحرجة (مثال: حذف مستفيد)
CREATE OR REPLACE FUNCTION public.audit_beneficiary_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM create_audit_log(
      'DELETE',
      'beneficiaries',
      OLD.id,
      row_to_json(OLD)::jsonb,
      NULL,
      'warning',
      'تم حذف مستفيد: ' || OLD.full_name
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM create_audit_log(
      'UPDATE',
      'beneficiaries',
      NEW.id,
      row_to_json(OLD)::jsonb,
      row_to_json(NEW)::jsonb,
      'info',
      'تم تحديث مستفيد: ' || NEW.full_name
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    PERFORM create_audit_log(
      'INSERT',
      'beneficiaries',
      NEW.id,
      NULL,
      row_to_json(NEW)::jsonb,
      'info',
      'تم إضافة مستفيد جديد: ' || NEW.full_name
    );
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_beneficiaries_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.beneficiaries
FOR EACH ROW EXECUTE FUNCTION audit_beneficiary_changes();
```

### 🎯 **التحسينات الإضافية:**

1. **إضافة Triggers لجداول أخرى**:
   - loans (القروض)
   - journal_entries (القيود المحاسبية)
   - distributions (التوزيعات)
   - payments (المدفوعات)
   - contracts (العقود)

2. **إضافة تقرير Analytics لـ Audit Logs**:
   - أكثر المستخدمين نشاطاً
   - أكثر العمليات تكراراً
   - الأنشطة المشبوهة
   - تقرير الأمان

3. **تحسين الـ Hook**:
```typescript
// src/hooks/useAuditLogs.ts - تحسين
export function useAuditLogs(filters: AuditLogFilters) {
  return useQuery({
    queryKey: ["audit_logs", filters],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (filters.tableName) {
        query = query.eq("table_name", filters.tableName);
      }
      if (filters.actionType) {
        query = query.eq("action_type", filters.actionType);
      }
      if (filters.severity) {
        query = query.eq("severity", filters.severity);
      }
      if (filters.startDate) {
        query = query.gte("created_at", filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte("created_at", filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    // Cache لمدة دقيقة فقط لأن البيانات حساسة
    staleTime: 60000,
  });
}
```

---

## 📈 خطة التنفيذ الموصى بها

### المرحلة 1: الإصلاحات الحرجة (الأسبوع الأول)
1. ✅ إنشاء جدول `audit_logs` + Triggers
2. ✅ إنشاء جدول `system_settings` + بيانات افتراضية
3. ✅ إنشاء Materialized Views للتقارير
4. ✅ إصلاح `useAuditLogs` و `useSystemSettings`

### المرحلة 2: التحسينات المتوسطة (الأسبوع الثاني)
1. إضافة Document Versions و Access Log
2. إنشاء تقارير تحليلية جديدة (KPIs, Comparative)
3. تحسين تصدير التقارير
4. إضافة صفحة إعدادات النظام المتقدمة

### المرحلة 3: التحسينات المستقبلية (الأسبوع الثالث)
1. تطبيق OCR للمستندات
2. نظام تصنيف تلقائي
3. تقارير Analytics للـ Audit Logs
4. تحسينات الأمان المتقدمة

---

## 🎯 التقييم النهائي

### قبل التحسينات:
```
┌──────────────────────┬─────────┬──────────┐
│       القسم          │ التقييم │  الحالة  │
├──────────────────────┼─────────┼──────────┤
│ الإدارة (Settings)   │ 75/100  │   🟡    │
│ التقارير (Reports)   │ 82/100  │   🟢    │
│ الأرشيف (Archive)    │ 88/100  │   🟢    │
│ سجل العمليات (Logs)  │ 60/100  │   🔴    │
├──────────────────────┼─────────┼──────────┤
│ المتوسط الإجمالي     │ 76/100  │   🟡    │
└──────────────────────┴─────────┴──────────┘
```

### بعد التحسينات المقترحة:
```
┌──────────────────────┬─────────┬──────────┐
│       القسم          │ التقييم │  الحالة  │
├──────────────────────┼─────────┼──────────┤
│ الإدارة (Settings)   │ 92/100  │   🟢    │
│ التقارير (Reports)   │ 95/100  │   🟢    │
│ الأرشيف (Archive)    │ 94/100  │   🟢    │
│ سجل العمليات (Logs)  │ 90/100  │   🟢    │
├──────────────────────┼─────────┼──────────┤
│ المتوسط الإجمالي     │ 93/100  │   🟢    │
└──────────────────────┴─────────┴──────────┘
```

---

## ✅ الخلاصة

النظام جيد بشكل عام ولكنه يحتاج إلى إصلاحات حرجة في:
1. **سجل العمليات** - الجدول غير موجود (أولوية قصوى)
2. **إعدادات النظام** - الجدول غير موجود (أولوية عالية)
3. **Materialized Views** - غير موجودة (أولوية عالية)

بعد تنفيذ التحسينات المقترحة، سيصبح النظام:
- ✅ آمن وموثوق مع تتبع كامل للعمليات
- ✅ مرن مع إعدادات قابلة للتخصيص
- ✅ سريع مع تقارير محسّنة
- ✅ احترافي مع وظائف متقدمة

**التوصية**: تنفيذ المرحلة 1 (الإصلاحات الحرجة) فوراً قبل الاستخدام في الإنتاج.
