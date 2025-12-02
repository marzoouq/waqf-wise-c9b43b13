-- ============================================
-- إصلاح شامل لسياسات الأمان (RLS Policies) - المحاولة 2
-- Comprehensive Security Fix - 15 Critical Issues
-- ============================================

-- ============================================
-- المرحلة 0: إنشاء الدوال المساعدة (Helper Functions)
-- ============================================

-- دالة للتحقق من دور الإداري أو الناظر
CREATE OR REPLACE FUNCTION public.is_admin_or_nazer()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'nazer')
  );
$$;

-- دالة للتحقق من الموظفين الماليين (محاسب، أمين صندوق، إداري، ناظر)
CREATE OR REPLACE FUNCTION public.is_financial_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('accountant', 'cashier', 'admin', 'nazer')
  );
$$;

-- دالة للتحقق من الموظفين بشكل عام
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'nazer', 'accountant', 'cashier', 'archivist')
  );
$$;

-- دالة للتحقق من المستفيد
CREATE OR REPLACE FUNCTION public.is_beneficiary()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'beneficiary'
  );
$$;

-- ============================================
-- المرحلة 1: إصلاح الجداول الحرجة
-- ============================================

-- 1. profiles - بيانات الموظفين
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "admins_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "admins_insert_profiles" ON profiles;
DROP POLICY IF EXISTS "admins_manage_profiles" ON profiles;

CREATE POLICY "users_view_own_profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "admins_view_all_profiles"
ON profiles FOR SELECT
USING (is_admin_or_nazer());

CREATE POLICY "users_update_own_profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "admins_insert_profiles"
ON profiles FOR INSERT
WITH CHECK (is_admin_or_nazer());

CREATE POLICY "admins_manage_profiles"
ON profiles FOR ALL
USING (is_admin_or_nazer());

-- 2. bank_accounts - الحسابات البنكية
DROP POLICY IF EXISTS "beneficiary_view_bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Enable read access for all users" ON bank_accounts;
DROP POLICY IF EXISTS "financial_staff_only" ON bank_accounts;
DROP POLICY IF EXISTS "financial_staff_manage" ON bank_accounts;
DROP POLICY IF EXISTS "financial_staff_view_bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "financial_staff_manage_bank_accounts" ON bank_accounts;

CREATE POLICY "financial_staff_view_bank_accounts"
ON bank_accounts FOR SELECT
USING (is_financial_staff());

CREATE POLICY "financial_staff_manage_bank_accounts"
ON bank_accounts FOR ALL
USING (is_financial_staff());

-- 3. contracts - عقود الإيجار
DROP POLICY IF EXISTS "beneficiary_view_contracts" ON contracts;
DROP POLICY IF EXISTS "Enable read access for all users" ON contracts;
DROP POLICY IF EXISTS "staff_only_contracts" ON contracts;
DROP POLICY IF EXISTS "staff_manage_contracts" ON contracts;
DROP POLICY IF EXISTS "staff_view_contracts" ON contracts;

CREATE POLICY "staff_view_contracts"
ON contracts FOR SELECT
USING (is_staff());

CREATE POLICY "staff_manage_contracts"
ON contracts FOR ALL
USING (is_staff());

-- 4. invoices - الفواتير
DROP POLICY IF EXISTS "beneficiary_view_invoices" ON invoices;
DROP POLICY IF EXISTS "Enable read access for all users" ON invoices;
DROP POLICY IF EXISTS "financial_staff_only_invoices" ON invoices;
DROP POLICY IF EXISTS "financial_staff_manage_invoices" ON invoices;
DROP POLICY IF EXISTS "financial_staff_view_invoices" ON invoices;

CREATE POLICY "financial_staff_view_invoices"
ON invoices FOR SELECT
USING (is_financial_staff());

CREATE POLICY "financial_staff_manage_invoices"
ON invoices FOR ALL
USING (is_financial_staff());

-- 5. emergency_aid_requests - طلبات الفزعات
DROP POLICY IF EXISTS "enable_read_for_all" ON emergency_aid_requests;
DROP POLICY IF EXISTS "Enable read access for all users" ON emergency_aid_requests;
DROP POLICY IF EXISTS "beneficiary_view_own_emergency_aid" ON emergency_aid_requests;
DROP POLICY IF EXISTS "staff_view_all_emergency_aid" ON emergency_aid_requests;
DROP POLICY IF EXISTS "beneficiary_insert_own_emergency_aid" ON emergency_aid_requests;
DROP POLICY IF EXISTS "staff_manage_emergency_aid" ON emergency_aid_requests;

CREATE POLICY "beneficiary_view_own_emergency_aid"
ON emergency_aid_requests FOR SELECT
USING (
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
  OR is_staff()
);

CREATE POLICY "beneficiary_insert_own_emergency_aid"
ON emergency_aid_requests FOR INSERT
WITH CHECK (
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
);

CREATE POLICY "staff_manage_emergency_aid"
ON emergency_aid_requests FOR ALL
USING (is_staff());

-- ============================================
-- المرحلة 2: إصلاح الجداول المالية
-- ============================================

-- 6. distributions - التوزيعات
DROP POLICY IF EXISTS "Enable read access for all users" ON distributions;
DROP POLICY IF EXISTS "beneficiaries_view_distributions_filtered" ON distributions;
DROP POLICY IF EXISTS "staff_view_all_distributions" ON distributions;
DROP POLICY IF EXISTS "staff_manage_distributions" ON distributions;

CREATE POLICY "staff_view_all_distributions"
ON distributions FOR SELECT
USING (is_staff());

CREATE POLICY "staff_manage_distributions"
ON distributions FOR ALL
USING (is_staff());

-- 7. loans - القروض
DROP POLICY IF EXISTS "Enable read access for all users" ON loans;
DROP POLICY IF EXISTS "beneficiaries_view_own_loans_only" ON loans;
DROP POLICY IF EXISTS "beneficiaries_view_own_loans" ON loans;
DROP POLICY IF EXISTS "staff_manage_loans" ON loans;

CREATE POLICY "beneficiaries_view_own_loans"
ON loans FOR SELECT
USING (
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
  OR is_staff()
);

CREATE POLICY "staff_manage_loans"
ON loans FOR ALL
USING (is_staff());

-- 8. payment_vouchers - سندات الصرف
DROP POLICY IF EXISTS "Enable read access for all users" ON payment_vouchers;
DROP POLICY IF EXISTS "beneficiaries_view_own_vouchers" ON payment_vouchers;
DROP POLICY IF EXISTS "financial_staff_manage_vouchers" ON payment_vouchers;

CREATE POLICY "beneficiaries_view_own_vouchers"
ON payment_vouchers FOR SELECT
USING (
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
  OR is_financial_staff()
);

CREATE POLICY "financial_staff_manage_vouchers"
ON payment_vouchers FOR ALL
USING (is_financial_staff());

-- 9. bank_transactions - المعاملات البنكية
DROP POLICY IF EXISTS "Enable read access for all users" ON bank_transactions;
DROP POLICY IF EXISTS "financial_staff_only_transactions" ON bank_transactions;
DROP POLICY IF EXISTS "financial_staff_view_transactions" ON bank_transactions;
DROP POLICY IF EXISTS "financial_staff_manage_transactions" ON bank_transactions;

CREATE POLICY "financial_staff_view_transactions"
ON bank_transactions FOR SELECT
USING (is_financial_staff());

CREATE POLICY "financial_staff_manage_transactions"
ON bank_transactions FOR ALL
USING (is_financial_staff());

-- 10. journal_entries - القيود المحاسبية
DROP POLICY IF EXISTS "beneficiary_view_journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "Enable read access for all users" ON journal_entries;
DROP POLICY IF EXISTS "financial_staff_only_journal" ON journal_entries;
DROP POLICY IF EXISTS "financial_staff_view_journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "financial_staff_manage_journal_entries" ON journal_entries;

CREATE POLICY "financial_staff_view_journal_entries"
ON journal_entries FOR SELECT
USING (is_financial_staff());

CREATE POLICY "financial_staff_manage_journal_entries"
ON journal_entries FOR ALL
USING (is_financial_staff());

-- ============================================
-- المرحلة 3: إصلاح الجداول الإدارية
-- ============================================

-- 11. rental_payments - دفعات الإيجار
DROP POLICY IF EXISTS "Enable read access for all users" ON rental_payments;
DROP POLICY IF EXISTS "staff_only_rental_payments" ON rental_payments;
DROP POLICY IF EXISTS "staff_view_rental_payments" ON rental_payments;
DROP POLICY IF EXISTS "staff_manage_rental_payments" ON rental_payments;

CREATE POLICY "staff_view_rental_payments"
ON rental_payments FOR SELECT
USING (is_staff());

CREATE POLICY "staff_manage_rental_payments"
ON rental_payments FOR ALL
USING (is_staff());

-- 12. maintenance_requests - طلبات الصيانة
DROP POLICY IF EXISTS "Enable read access for all users" ON maintenance_requests;
DROP POLICY IF EXISTS "staff_only_maintenance" ON maintenance_requests;
DROP POLICY IF EXISTS "staff_view_maintenance" ON maintenance_requests;
DROP POLICY IF EXISTS "staff_manage_maintenance" ON maintenance_requests;

CREATE POLICY "staff_view_maintenance"
ON maintenance_requests FOR SELECT
USING (is_staff());

CREATE POLICY "staff_manage_maintenance"
ON maintenance_requests FOR ALL
USING (is_staff());

-- 13. fiscal_years - السنوات المالية
DROP POLICY IF EXISTS "Enable read access for all users" ON fiscal_years;
DROP POLICY IF EXISTS "staff_only_fiscal_years" ON fiscal_years;
DROP POLICY IF EXISTS "staff_view_fiscal_years" ON fiscal_years;
DROP POLICY IF EXISTS "staff_manage_fiscal_years" ON fiscal_years;

CREATE POLICY "staff_view_fiscal_years"
ON fiscal_years FOR SELECT
USING (is_staff());

CREATE POLICY "staff_manage_fiscal_years"
ON fiscal_years FOR ALL
USING (is_staff());

-- 14. waqf_distribution_settings - إعدادات التوزيع
DROP POLICY IF EXISTS "Enable read access for all users" ON waqf_distribution_settings;
DROP POLICY IF EXISTS "admin_nazer_only_settings" ON waqf_distribution_settings;
DROP POLICY IF EXISTS "admin_nazer_manage_settings" ON waqf_distribution_settings;
DROP POLICY IF EXISTS "admin_nazer_view_settings" ON waqf_distribution_settings;

CREATE POLICY "admin_nazer_view_settings"
ON waqf_distribution_settings FOR SELECT
USING (is_admin_or_nazer());

CREATE POLICY "admin_nazer_manage_settings"
ON waqf_distribution_settings FOR ALL
USING (is_admin_or_nazer());

-- 15. heir_distributions - توزيعات الورثة
DROP POLICY IF EXISTS "Enable read access for all users" ON heir_distributions;
DROP POLICY IF EXISTS "beneficiaries_view_own_distributions" ON heir_distributions;
DROP POLICY IF EXISTS "beneficiaries_view_own_heir_distributions" ON heir_distributions;
DROP POLICY IF EXISTS "staff_manage_heir_distributions" ON heir_distributions;

CREATE POLICY "beneficiaries_view_own_heir_distributions"
ON heir_distributions FOR SELECT
USING (
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
  OR is_staff()
);

CREATE POLICY "staff_manage_heir_distributions"
ON heir_distributions FOR ALL
USING (is_staff());

-- ============================================
-- إصلاحات إضافية لجداول أخرى
-- ============================================

-- properties - العقارات (للموظفين فقط)
DROP POLICY IF EXISTS "Enable read access for all users" ON properties;
DROP POLICY IF EXISTS "beneficiary_view_properties" ON properties;
DROP POLICY IF EXISTS "staff_view_properties" ON properties;
DROP POLICY IF EXISTS "staff_manage_properties" ON properties;

CREATE POLICY "staff_view_properties"
ON properties FOR SELECT
USING (is_staff());

CREATE POLICY "staff_manage_properties"
ON properties FOR ALL
USING (is_staff());

-- accounts - الحسابات المحاسبية
DROP POLICY IF EXISTS "Enable read access for all users" ON accounts;
DROP POLICY IF EXISTS "financial_staff_view_accounts" ON accounts;
DROP POLICY IF EXISTS "financial_staff_manage_accounts" ON accounts;

CREATE POLICY "financial_staff_view_accounts"
ON accounts FOR SELECT
USING (is_financial_staff());

CREATE POLICY "financial_staff_manage_accounts"
ON accounts FOR ALL
USING (is_financial_staff());

-- payments - المدفوعات (المستفيد يرى مدفوعاته فقط)
DROP POLICY IF EXISTS "Enable read access for all users" ON payments;
DROP POLICY IF EXISTS "beneficiaries_view_own_payments" ON payments;
DROP POLICY IF EXISTS "staff_manage_payments" ON payments;

CREATE POLICY "beneficiaries_view_own_payments"
ON payments FOR SELECT
USING (
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
  OR is_staff()
);

CREATE POLICY "staff_manage_payments"
ON payments FOR ALL
USING (is_staff());