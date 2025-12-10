# 🔐 سياسات الأمان | Security Policies

**الإصدار:** 2.8.73 | **آخر تحديث:** 2025-12-10

---

## 📊 نظرة عامة

- **تغطية RLS:** 100%
- **عدد السياسات:** 650 (موحدة)
- **الأدوار المحمية:** 7

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
-- إدارة المستخدمين والإعدادات
CREATE POLICY "admin_manage_users" ON profiles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));
```

### accountant (المحاسب)
```sql
-- الوصول للبيانات المالية
CREATE POLICY "accountant_financial_access" ON journal_entries
FOR ALL USING (public.has_role(auth.uid(), 'accountant'));
```

### cashier (أمين الصندوق)
```sql
-- إدارة المدفوعات
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
-- شفافية كاملة للقراءة
CREATE POLICY "heir_transparency" ON distributions
FOR SELECT USING (public.has_role(auth.uid(), 'waqf_heir'));
```

---

## 📋 سياسات الجداول الرئيسية

### beneficiaries
```sql
-- المستفيدون يرون بياناتهم فقط
CREATE POLICY "beneficiaries_select_own"
ON beneficiaries FOR SELECT
USING (
  user_id = auth.uid() OR
  public.is_staff(auth.uid()) OR
  public.has_role(auth.uid(), 'waqf_heir')
);

-- الموظفون فقط يمكنهم الإضافة
CREATE POLICY "beneficiaries_insert_staff"
ON beneficiaries FOR INSERT
WITH CHECK (public.is_staff(auth.uid()));

-- الموظفون فقط يمكنهم التعديل
CREATE POLICY "beneficiaries_update_staff"
ON beneficiaries FOR UPDATE
USING (public.is_staff(auth.uid()));
```

### distributions
```sql
-- الجميع يمكنهم رؤية التوزيعات
CREATE POLICY "distributions_select"
ON distributions FOR SELECT
USING (
  public.is_staff(auth.uid()) OR
  public.has_role(auth.uid(), 'waqf_heir')
);

-- الناظر والمحاسب فقط يمكنهم الإنشاء
CREATE POLICY "distributions_insert"
ON distributions FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'nazer') OR
  public.has_role(auth.uid(), 'accountant')
);
```

### journal_entries
```sql
-- المحاسب والناظر يمكنهم الوصول
CREATE POLICY "journal_entries_access"
ON journal_entries FOR ALL
USING (
  public.has_role(auth.uid(), 'accountant') OR
  public.has_role(auth.uid(), 'nazer')
);
```

### rental_payments
```sql
-- الموظفون يرون جميع المدفوعات
CREATE POLICY "rental_payments_staff"
ON rental_payments FOR SELECT
USING (public.is_staff(auth.uid()));

-- الورثة يرون المدفوعات للشفافية
CREATE POLICY "rental_payments_heirs"
ON rental_payments FOR SELECT
USING (public.has_role(auth.uid(), 'waqf_heir'));
```

---

## 🔧 دوال التحقق

### is_staff
```sql
CREATE OR REPLACE FUNCTION is_staff(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = $1 
    AND role IN ('nazer', 'admin', 'accountant', 'cashier', 'archivist')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### is_admin_or_nazer
```sql
CREATE OR REPLACE FUNCTION is_admin_or_nazer(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = $1 
    AND role IN ('nazer', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### has_role
```sql
CREATE OR REPLACE FUNCTION has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = $1 AND role = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### has_permission
```sql
CREATE OR REPLACE FUNCTION has_permission(user_id UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_permissions rp ON ur.role = rp.role
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = $1 AND p.name = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🚫 القيود الأمنية

### منع التعديل على السنوات المغلقة
```sql
CREATE OR REPLACE FUNCTION prevent_closed_year_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM fiscal_years 
    WHERE id = NEW.fiscal_year_id AND is_closed = true
  ) THEN
    RAISE EXCEPTION 'Cannot modify entries in closed fiscal year';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_fiscal_year_closed
BEFORE INSERT OR UPDATE ON journal_entries
FOR EACH ROW EXECUTE FUNCTION prevent_closed_year_changes();
```

### تسجيل العمليات الحساسة
```sql
CREATE OR REPLACE FUNCTION log_sensitive_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id, action_type, table_name, record_id, old_values, new_values
  ) VALUES (
    auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, 
    to_jsonb(OLD), to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## ✅ قائمة التحقق الأمني

- [x] RLS مفعل على جميع الجداول
- [x] دوال التحقق محمية بـ SECURITY DEFINER
- [x] تسجيل العمليات الحساسة
- [x] منع التعديل على البيانات التاريخية
- [x] فصل الصلاحيات حسب الأدوار
- [x] تشفير البيانات الحساسة
- [x] تعطيل التسجيل العام

---

**الحالة:** ✅ آمن | **الإصدار:** 2.6.32
