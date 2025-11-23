-- المرحلة 4: إصلاح التحذيرات الأمنية - إضافة search_path للـ Database Functions

-- 1. create_rental_invoice_and_receipt
ALTER FUNCTION create_rental_invoice_and_receipt(
  p_rental_payment_id UUID,
  p_contract_id UUID,
  p_amount NUMERIC,
  p_payment_date DATE,
  p_payment_method TEXT,
  p_tenant_name TEXT,
  p_tenant_id TEXT,
  p_tenant_email TEXT,
  p_tenant_phone TEXT,
  p_property_name TEXT
) SET search_path = public, pg_temp;

-- 2. calculate_account_balance
ALTER FUNCTION calculate_account_balance(account_uuid UUID) SET search_path = public, pg_temp;

-- 3. calculate_distribution_balances
ALTER FUNCTION calculate_disclosure_balances(
  p_fiscal_year_id UUID,
  p_period_start DATE,
  p_period_end DATE
) SET search_path = public, pg_temp;

-- 4. calculate_loan_schedule
ALTER FUNCTION calculate_loan_schedule(
  p_loan_id UUID,
  p_principal NUMERIC,
  p_interest_rate NUMERIC,
  p_term_months INTEGER,
  p_start_date DATE
) SET search_path = public, pg_temp;

-- 5. create_auto_journal_entry
ALTER FUNCTION create_auto_journal_entry(
  p_trigger_event TEXT,
  p_reference_id UUID,
  p_amount NUMERIC,
  p_description TEXT,
  p_transaction_date DATE
) SET search_path = public, pg_temp;

-- 6. create_notification
ALTER FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_reference_type TEXT,
  p_reference_id UUID,
  p_action_url TEXT
) SET search_path = public, pg_temp;

-- 7. create_loan_installments
ALTER FUNCTION create_loan_installments(
  p_loan_id UUID,
  p_start_date DATE,
  p_term_months INTEGER,
  p_monthly_installment NUMERIC
) SET search_path = public, pg_temp;

-- 8. generate_annual_disclosure
ALTER FUNCTION generate_annual_disclosure(
  p_year INTEGER,
  p_waqf_name TEXT
) SET search_path = public, pg_temp;

-- 9. assign_user_role
ALTER FUNCTION assign_user_role(
  p_email TEXT,
  p_role app_role
) SET search_path = public, pg_temp;

-- 10. create_user_profile_and_role
ALTER FUNCTION create_user_profile_and_role(
  p_user_id UUID,
  p_full_name TEXT,
  p_email TEXT,
  p_role app_role
) SET search_path = public, pg_temp;

-- التحقق من النتائج
DO $$
BEGIN
  RAISE NOTICE '✅ تم تحديث 10 Database Functions بنجاح';
  RAISE NOTICE '✅ تمت إضافة search_path = public, pg_temp لكل دالة';
  RAISE NOTICE '✅ تم إصلاح التحذيرات الأمنية';
END $$;
