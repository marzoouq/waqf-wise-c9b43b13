# 🔐 سياسات الأمان | Security Policies

**الإصدار:** 3.1.0 | **آخر تحديث:** 2025-12-22

---

## 📊 نظرة عامة

- **تغطية RLS:** 100%
- **عدد السياسات:** 675 سياسة
- **الأدوار المحمية:** 7
- **Database Triggers:** 200
- **Audit Logging:** ✅ مفعّل على الجداول الحساسة

---

## 🆕 إصلاحات الأمان الأخيرة (2025-12-20)

### تعارضات تم إصلاحها

| الجدول | المشكلة | الحل |
|--------|---------|------|
| `user_roles` | 7 سياسات متعارضة (تضارب بين `check_is_admin_direct` و `is_admin`) | تقليص إلى 2 سياسات واضحة |
| `beneficiaries` | سياستان SELECT متداخلتان | توحيد في سياسة واحدة |
| `tenants` | 6 سياسات متداخلة + `archivist` لديه ALL | تقليص إلى 3 سياسات + منع archivist من التعديل |

### Audit Logging المُفعّل

```sql
-- Triggers مفعّلة على:
✅ beneficiaries (audit_beneficiaries_changes)
✅ bank_accounts (audit_bank_accounts_changes)  
✅ tenants (audit_tenants_changes)
✅ journal_entries, properties, distributions, contracts, loans, funds, families, user_roles
```

---

## 🛡 المبادئ الأساسية

### 1. عزل البيانات
- كل مستفيد يرى بياناته فقط
- الموظفون يرون البيانات حسب صلاحياتهم
- الناظر يرى كل شيء

### 2. الشفافية للورثة
- ورثة الوقف (`waqf_heir`) لهم شفافية كاملة
- يرون جميع بيانات الوقف والتوزيعات
- لا يمكنهم التعديل

### 3. التحقق متعدد المستويات
- التحقق في قاعدة البيانات (RLS)
- التحقق في الكود (Hooks)
- التحقق في الواجهة (Components)

---

## 👥 الأدوار والصلاحيات

### nazer (الناظر)
```sql
-- وصول كامل لجميع البيانات
CREATE POLICY "nazer_full_access" ON beneficiaries
FOR ALL USING (public.has_role(auth.uid(), 'nazer'));
```

### admin (المدير)
```sql
-- إدارة المستخدمين والإعدادات (admin فقط - ليس nazer)
CREATE POLICY "admin_manage_user_roles" ON user_roles
FOR ALL USING (public.is_admin(auth.uid()));
```

### accountant (المحاسب)
```sql
-- الوصول للبيانات المالية
CREATE POLICY "accountant_financial_access" ON journal_entries
FOR ALL USING (public.has_role(auth.uid(), 'accountant'));
```

### cashier (أمين الصندوق)
```sql
-- إدارة المدفوعات فقط (ليس المستأجرين)
CREATE POLICY "cashier_payments_access" ON payments
FOR ALL USING (public.has_role(auth.uid(), 'cashier'));
```

### beneficiary (المستفيد)
```sql
-- رؤية بياناته فقط
CREATE POLICY "beneficiary_own_data" ON beneficiaries
FOR SELECT USING (user_id = auth.uid());
```

### waqf_heir (وريث الوقف)
```sql
-- شفافية كاملة للقراءة فقط
CREATE POLICY "heir_transparency" ON distributions
FOR SELECT USING (public.has_role(auth.uid(), 'waqf_heir'));
```

---

## 📋 سياسات الجداول الرئيسية (بعد التوحيد)

### user_roles (2 سياسات فقط)
```sql
-- السياسة 1: المدير يدير جميع الأدوار
CREATE POLICY "admin_manage_user_roles" ON user_roles
FOR ALL USING (public.is_admin(auth.uid()));

-- السياسة 2: المستخدم يرى دوره فقط
CREATE POLICY "users_read_own_role_secure" ON user_roles
FOR SELECT USING (
  user_id = auth.uid() OR public.is_admin(auth.uid())
);
```

### beneficiaries (سياسة SELECT موحدة)
```sql
-- سياسة واحدة تغطي جميع الحالات
CREATE POLICY "beneficiaries_select_unified"
ON beneficiaries FOR SELECT
USING (
  public.is_staff_only(auth.uid()) OR
  public.has_role(auth.uid(), 'waqf_heir') OR
  user_id = auth.uid()
);
```

### tenants (3 سياسات)
```sql
-- 1. الناظر والمحاسب: وصول كامل
CREATE POLICY "Nazer and Accountant full access to tenants" ON tenants
FOR ALL USING (
  public.has_role(auth.uid(), 'nazer') OR
  public.has_role(auth.uid(), 'accountant')
);

-- 2. الموظفون: إضافة فقط
CREATE POLICY "Staff can insert tenants" ON tenants
FOR INSERT WITH CHECK (public.is_staff_only(auth.uid()));

-- 3. الورثة: قراءة للشفافية
CREATE POLICY "tenants_waqf_heir_view" ON tenants
FOR SELECT USING (public.has_role(auth.uid(), 'waqf_heir'));
```

---

## 🔧 دوال التحقق (SECURITY DEFINER)

### has_role
```sql
CREATE OR REPLACE FUNCTION has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = $1 AND role = $2
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
```

### is_admin
```sql
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = $1 AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
```

### is_staff_only
```sql
CREATE OR REPLACE FUNCTION is_staff_only(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = $1 
    AND role IN ('nazer', 'admin', 'accountant', 'cashier', 'archivist')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
```

### is_financial_staff
```sql
CREATE OR REPLACE FUNCTION is_financial_staff(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = $1 
    AND role IN ('nazer', 'accountant', 'cashier')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
```

---

## 📝 Audit Logging (تسجيل العمليات)

### دالة log_table_changes
```sql
CREATE OR REPLACE FUNCTION log_table_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id, user_email, action_type, table_name, 
    record_id, old_values, new_values, description, severity
  ) VALUES (
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id)::text,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    'Automated audit: ' || TG_OP || ' on ' || TG_TABLE_NAME,
    CASE 
      WHEN TG_TABLE_NAME = 'bank_accounts' THEN 'warning'
      WHEN TG_OP = 'DELETE' THEN 'warning'
      ELSE 'info'
    END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

### الجداول المُراقبة
| الجدول | Trigger | Severity |
|--------|---------|----------|
| `beneficiaries` | `audit_beneficiaries_changes` | info/warning |
| `bank_accounts` | `audit_bank_accounts_changes` | warning |
| `tenants` | `audit_tenants_changes` | info/warning |
| `journal_entries` | `audit_journal_entries_changes` | info/warning |
| `properties` | `audit_properties_changes` | info/warning |
| `distributions` | `audit_distributions_changes` | info/warning |
| `contracts` | `audit_contracts_changes` | info/warning |
| `loans` | `audit_loans_changes` | info/warning |
| `funds` | `audit_funds_changes` | info/warning |
| `user_roles` | `audit_user_roles_changes` | warning |
| `families` | `audit_families_changes` | info/warning |

---

## ✅ قائمة التحقق الأمني

- [x] RLS مفعل على جميع الجداول
- [x] دوال التحقق محمية بـ SECURITY DEFINER
- [x] **Audit Logging مفعّل على الجداول الحساسة**
- [x] **لا توجد سياسات متعارضة**
- [x] منع التعديل على البيانات التاريخية
- [x] فصل الصلاحيات حسب الأدوار
- [x] **منع archivist من تعديل tenants**
- [x] **admin فقط يدير user_roles (وليس nazer)**
- [x] تعطيل التسجيل العام

---

## 🔒 ملخص الأمان

| المقياس | القيمة |
|---------|--------|
| سياسات RLS النشطة | 650+ |
| تعارضات السياسات | 0 ✅ |
| Audit Triggers | 11 trigger نشط |
| دوال SECURITY DEFINER | 10+ دوال |
| جداول بدون RLS | 0 ✅ |

---

**الحالة:** ✅ آمن ومحدّث | **الإصدار:** 2.9.89
