-- =====================================================
-- المرحلة 1: إنشاء دوال مساعدة للورثة
-- =====================================================

-- 1.1 دالة is_heir() - اختصار للتحقق من دور الوارث
CREATE OR REPLACE FUNCTION public.is_heir()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'waqf_heir'::app_role
  )
$$;

-- 1.2 دالة get_heir_beneficiary_id() - الحصول على معرف المستفيد للوارث
CREATE OR REPLACE FUNCTION public.get_heir_beneficiary_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT id FROM beneficiaries WHERE user_id = auth.uid() LIMIT 1
$$;

-- 1.3 دالة is_heir_own_data() - التحقق من ملكية البيانات
CREATE OR REPLACE FUNCTION public.is_heir_own_data(_beneficiary_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT 
    public.is_heir() AND 
    _beneficiary_id = public.get_heir_beneficiary_id()
$$;

-- =====================================================
-- المرحلة 2: تعديل سياسات RLS للجداول الحساسة
-- =====================================================

-- 2.1 جدول loans - إزالة وصول الورثة الكامل
DROP POLICY IF EXISTS "loans_select_heirs" ON loans;

-- 2.2 جدول emergency_aid_requests - الورثة يرون طلباتهم فقط
DROP POLICY IF EXISTS "waqf_heirs_view_all_emergency_aid" ON emergency_aid_requests;
DROP POLICY IF EXISTS "emergency_aid_select_unified" ON emergency_aid_requests;

CREATE POLICY "emergency_aid_select_unified" ON emergency_aid_requests
FOR SELECT USING (
  is_staff_only() 
  OR is_heir_own_data(beneficiary_id)
  OR (beneficiary_id = get_heir_beneficiary_id() AND NOT is_staff_only())
);

-- 2.3 جدول tenants - إزالة وصول الورثة
DROP POLICY IF EXISTS "Heirs read only tenants" ON tenants;

-- 2.4 جدول payments - الورثة يرون مدفوعاتهم فقط
DROP POLICY IF EXISTS "payments_select_heirs" ON payments;

CREATE POLICY "payments_select_heirs_own" ON payments
FOR SELECT USING (
  is_heir() AND beneficiary_id = get_heir_beneficiary_id()
);

-- 2.5 جدول heir_distributions - الورثة يرون توزيعاتهم فقط
DROP POLICY IF EXISTS "waqf_heirs_view_all_heir_distributions" ON heir_distributions;

-- 2.6 جدول bank_accounts - إزالة وصول الورثة
DROP POLICY IF EXISTS "bank_accounts_select_unified" ON bank_accounts;

CREATE POLICY "bank_accounts_select_staff_only" ON bank_accounts
FOR SELECT USING (
  is_admin_or_nazer() OR is_financial_staff()
);

-- =====================================================
-- المرحلة 3: إصلاح landing_page_settings
-- =====================================================

DROP POLICY IF EXISTS "Public read landing_settings" ON landing_page_settings;

-- العامة يرون فقط المعلومات غير الحساسة
CREATE POLICY "public_read_non_sensitive" ON landing_page_settings
FOR SELECT USING (
  is_active = true 
  AND setting_key NOT IN ('contact_phone', 'contact_email', 'contact_address')
);

-- الموظفون يرون كل المعلومات
CREATE POLICY "staff_read_all_settings" ON landing_page_settings
FOR SELECT USING (is_staff_only());