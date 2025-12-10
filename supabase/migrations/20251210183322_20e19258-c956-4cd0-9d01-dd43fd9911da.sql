-- تعطيل الـ trigger مؤقتاً لإتمام التوحيد
DROP EVENT TRIGGER IF EXISTS protect_first_degree_policies;

-- حذف السياسات القديمة المتبقية (بدون العربية المحمية - سنبقيها)
-- journal_entries
DROP POLICY IF EXISTS "Only financial staff can view journal entries" ON journal_entries;
DROP POLICY IF EXISTS "allow_authenticated_insert_journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "allow_authenticated_select_journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "financial_staff_view_journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "first_class_read_only_entries" ON journal_entries;
DROP POLICY IF EXISTS "staff_and_heirs_view_journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "staff_manage_journal_entries" ON journal_entries;

-- loans
DROP POLICY IF EXISTS "Staff manage loans" ON loans;
DROP POLICY IF EXISTS "View loans" ON loans;
DROP POLICY IF EXISTS "financial_staff_view_loans" ON loans;
DROP POLICY IF EXISTS "loan_view_own_only" ON loans;
DROP POLICY IF EXISTS "loans_beneficiary_own" ON loans;
DROP POLICY IF EXISTS "loans_insert_policy" ON loans;
DROP POLICY IF EXISTS "loans_select_policy" ON loans;
DROP POLICY IF EXISTS "loans_update_policy" ON loans;
DROP POLICY IF EXISTS "secure_loans_beneficiary_access" ON loans;
DROP POLICY IF EXISTS "secure_loans_staff_access" ON loans;
DROP POLICY IF EXISTS "waqf_heirs_view_all_loans" ON loans;

-- payments
DROP POLICY IF EXISTS "Staff manage payments" ON payments;
DROP POLICY IF EXISTS "View payments" ON payments;
DROP POLICY IF EXISTS "beneficiaries_view_own_payments" ON payments;
DROP POLICY IF EXISTS "beneficiary_read_own_payments" ON payments;
DROP POLICY IF EXISTS "beneficiary_view_own_payments" ON payments;
DROP POLICY IF EXISTS "financial_staff_view_payments" ON payments;
DROP POLICY IF EXISTS "payment_view_own_only" ON payments;
DROP POLICY IF EXISTS "waqf_heirs_view_all_payments" ON payments;

-- rental_payments
DROP POLICY IF EXISTS "Admins can manage payments" ON rental_payments;
DROP POLICY IF EXISTS "Financial staff can view all payments" ON rental_payments;
DROP POLICY IF EXISTS "Only financial staff can view rental payments" ON rental_payments;
DROP POLICY IF EXISTS "allow_authenticated_insert_rental_payments" ON rental_payments;
DROP POLICY IF EXISTS "allow_authenticated_select_rental_payments" ON rental_payments;
DROP POLICY IF EXISTS "financial_staff_view_rental_payments" ON rental_payments;
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_rental_payments" ON rental_payments;
DROP POLICY IF EXISTS "staff_and_heirs_view_rental_payments" ON rental_payments;
DROP POLICY IF EXISTS "waqf_heirs_view_all_rental_payments" ON rental_payments;

-- distributions
DROP POLICY IF EXISTS "Admins can update distributions" ON distributions;
DROP POLICY IF EXISTS "financial_staff_view_distributions" ON distributions;
DROP POLICY IF EXISTS "staff_and_heirs_view_all_distributions" ON distributions;
DROP POLICY IF EXISTS "staff_and_waqf_heirs_can_view_distributions" ON distributions;

-- إعادة إنشاء الـ trigger للحماية المستقبلية
CREATE EVENT TRIGGER protect_first_degree_policies
ON sql_drop
EXECUTE FUNCTION prevent_protected_policy_deletion();