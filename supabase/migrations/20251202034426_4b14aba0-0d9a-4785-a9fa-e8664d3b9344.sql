-- ============================================
-- تنظيف سياسات RLS - توحيد وتبسيط (إصدار محدّث)
-- ============================================

-- ============================================
-- 1. تنظيف سياسات bank_accounts
-- ============================================

-- حذف جميع السياسات الموجودة
DROP POLICY IF EXISTS "financial_staff_view_bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "admin_manage_bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "accountant_update_bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Admin full access to bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Accountant can view bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Cashier can view bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Staff can view bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Financial staff can view bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Financial staff can update bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Waqf heirs can view bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "First class beneficiaries can view bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON bank_accounts;

-- إنشاء سياسات واضحة ومبسطة
CREATE POLICY "bank_accounts_staff_select"
  ON bank_accounts FOR SELECT
  USING (is_financial_staff());

CREATE POLICY "bank_accounts_admin_all"
  ON bank_accounts FOR ALL
  USING (is_admin_or_nazer());

-- ============================================
-- 2. تنظيف سياسات loans
-- ============================================

DROP POLICY IF EXISTS "beneficiaries_view_own_loans" ON loans;
DROP POLICY IF EXISTS "staff_view_all_loans" ON loans;
DROP POLICY IF EXISTS "admin_manage_loans" ON loans;
DROP POLICY IF EXISTS "financial_staff_update_loans" ON loans;
DROP POLICY IF EXISTS "Admin can manage all loans" ON loans;
DROP POLICY IF EXISTS "Nazer can view loans" ON loans;
DROP POLICY IF EXISTS "Accountant can view loans" ON loans;
DROP POLICY IF EXISTS "Financial staff can view loans" ON loans;
DROP POLICY IF EXISTS "Staff can view loans" ON loans;
DROP POLICY IF EXISTS "Waqf heirs can view all loans" ON loans;
DROP POLICY IF EXISTS "First class beneficiaries can view all loans" ON loans;
DROP POLICY IF EXISTS "Beneficiaries can view own loans" ON loans;
DROP POLICY IF EXISTS "Beneficiaries can view their loans" ON loans;
DROP POLICY IF EXISTS "Users can view their own loans" ON loans;
DROP POLICY IF EXISTS "Enable read access for all users" ON loans;

-- سياسات مبسطة
CREATE POLICY "loans_beneficiary_own"
  ON loans FOR SELECT
  USING (
    beneficiary_id IN (
      SELECT id FROM beneficiaries WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "loans_staff_all"
  ON loans FOR ALL
  USING (is_staff_only());

-- ============================================
-- 3. تنظيف سياسات emergency_aid_requests
-- ============================================

DROP POLICY IF EXISTS "beneficiaries_view_own_emergency_aid" ON emergency_aid_requests;
DROP POLICY IF EXISTS "staff_view_all_emergency_aid" ON emergency_aid_requests;
DROP POLICY IF EXISTS "staff_manage_emergency_aid" ON emergency_aid_requests;
DROP POLICY IF EXISTS "Waqf heirs can view all emergency aid requests" ON emergency_aid_requests;
DROP POLICY IF EXISTS "First class beneficiaries can view all emergency aid" ON emergency_aid_requests;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON emergency_aid_requests;

CREATE POLICY "emergency_aid_beneficiary_own"
  ON emergency_aid_requests FOR SELECT
  USING (
    beneficiary_id IN (
      SELECT id FROM beneficiaries WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "emergency_aid_staff_all"
  ON emergency_aid_requests FOR ALL
  USING (is_staff_only());

-- ============================================
-- 4. تنظيف سياسات profiles (إزالة وصول waqf_heir)
-- ============================================

DROP POLICY IF EXISTS "Waqf heirs can view all profiles" ON profiles;
DROP POLICY IF EXISTS "First class beneficiaries can view profiles" ON profiles;

-- ============================================
-- 5. تنظيف سياسات beneficiaries (إزالة وصول waqf_heir)
-- ============================================

DROP POLICY IF EXISTS "Waqf heirs can view all beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "First class beneficiaries can view beneficiaries" ON beneficiaries;

-- ============================================
-- 6. تنظيف سياسات rental_payments
-- ============================================

DROP POLICY IF EXISTS "financial_staff_manage_rental_payments" ON rental_payments;
DROP POLICY IF EXISTS "Waqf heirs can view rental payments" ON rental_payments;
DROP POLICY IF EXISTS "First class beneficiaries can view rental payments" ON rental_payments;

CREATE POLICY "rental_payments_financial_staff"
  ON rental_payments FOR ALL
  USING (is_financial_staff());

-- ============================================
-- 7. تنظيف سياسات distributions
-- ============================================

DROP POLICY IF EXISTS "staff_manage_distributions" ON distributions;
DROP POLICY IF EXISTS "beneficiaries_view_own_distributions" ON distributions;
DROP POLICY IF EXISTS "Waqf heirs can view distributions" ON distributions;

CREATE POLICY "distributions_staff_all"
  ON distributions FOR ALL
  USING (is_staff_only());

CREATE POLICY "distributions_beneficiary_own"
  ON distributions FOR SELECT
  USING (
    id IN (
      SELECT distribution_id FROM distribution_details
      WHERE beneficiary_id IN (
        SELECT id FROM beneficiaries WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================
-- تسجيل التغييرات
-- ============================================

INSERT INTO audit_logs (
  action_type,
  description,
  severity,
  new_values
) VALUES (
  'rls_policies_cleanup_v2',
  'تم تنظيف وتوحيد سياسات RLS - حذف الوصول غير المصرح به',
  'info',
  jsonb_build_object(
    'bank_accounts_policies', 'تبسيط إلى سياستين',
    'loans_policies', 'تبسيط إلى سياستين',
    'emergency_aid_policies', 'تبسيط إلى سياستين',
    'removed_waqf_heir_access', true,
    'removed_first_class_access', true,
    'security_improvement', 'منع انتهاكات الخصوصية'
  )
);