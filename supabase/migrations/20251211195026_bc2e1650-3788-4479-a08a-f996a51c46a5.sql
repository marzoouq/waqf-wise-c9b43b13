-- =====================================================
-- تنظيف سياسات bank_accounts المتكررة
-- =====================================================

-- حذف السياسات القديمة المتكررة إن وجدت
DROP POLICY IF EXISTS "Admin manage bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "bank_accounts_admin_all" ON bank_accounts;
DROP POLICY IF EXISTS "financial_staff_manage_bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "staff_manage_bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Financial staff view bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Only financial staff can view bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "bank_accounts_staff_select" ON bank_accounts;
DROP POLICY IF EXISTS "financial_staff_view_bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "staff_and_heirs_view_bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "waqf_heirs_view_bank_accounts" ON bank_accounts;