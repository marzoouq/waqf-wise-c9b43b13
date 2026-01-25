-- ========================================
-- إصلاح مشاكل الأمان الخطيرة - تشديد RLS (v2)
-- ========================================

-- 1. تقييد وصول waqf_heir إلى tenants
DROP POLICY IF EXISTS "tenants_waqf_heir_view" ON public.tenants;

-- 2. تقييد contracts للموظفين فقط
DROP POLICY IF EXISTS "contracts_beneficiary_view" ON public.contracts;
DROP POLICY IF EXISTS "contracts_waqf_heir_view" ON public.contracts;

CREATE POLICY "contracts_staff_only_select" ON public.contracts
FOR SELECT USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'nazer'::app_role) OR
  public.has_role(auth.uid(), 'accountant'::app_role) OR
  public.has_role(auth.uid(), 'cashier'::app_role)
);

-- 3. دالة لإخفاء البيانات الحساسة
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(input_text text, show_chars int DEFAULT 4)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF input_text IS NULL THEN RETURN NULL; END IF;
  IF LENGTH(input_text) <= show_chars THEN RETURN REPEAT('*', LENGTH(input_text)); END IF;
  RETURN REPEAT('*', LENGTH(input_text) - show_chars) || RIGHT(input_text, show_chars);
END;
$$;

-- 4. View آمن للمستفيدين
CREATE OR REPLACE VIEW public.beneficiaries_secure AS
SELECT 
  id, beneficiary_number, full_name,
  CASE WHEN public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'nazer'::app_role)
    THEN national_id ELSE public.mask_sensitive_data(national_id) END AS national_id,
  CASE WHEN public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'nazer'::app_role)
    THEN phone ELSE public.mask_sensitive_data(phone) END AS phone,
  CASE WHEN public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'nazer'::app_role)
    THEN email ELSE public.mask_sensitive_data(email) END AS email,
  CASE WHEN public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'nazer'::app_role)
    THEN iban ELSE public.mask_sensitive_data(iban) END AS iban,
  category, status, family_id, family_name, gender, marital_status, account_balance, total_received, created_at, updated_at
FROM public.beneficiaries WHERE deleted_at IS NULL;

-- 5. تقييد profiles
DROP POLICY IF EXISTS "profiles_select_unified" ON public.profiles;

CREATE POLICY "profiles_own_or_admin_select" ON public.profiles
FOR SELECT USING (
  id = auth.uid() OR
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'nazer'::app_role)
);

-- 6. Rate Limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_user_id uuid, p_table_name text, p_max_per_hour int DEFAULT 10)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE recent_count int;
BEGIN
  EXECUTE format('SELECT COUNT(*) FROM %I WHERE created_at > NOW() - INTERVAL ''1 hour''', p_table_name) INTO recent_count;
  RETURN recent_count < p_max_per_hour;
END;
$$;

-- 7. سياسة beneficiary_requests محدثة
DROP POLICY IF EXISTS "requests_insert_unified" ON public.beneficiary_requests;

CREATE POLICY "requests_insert_with_limit" ON public.beneficiary_requests
FOR INSERT WITH CHECK (
  beneficiary_id IN (SELECT id FROM public.beneficiaries WHERE user_id = auth.uid() AND deleted_at IS NULL)
);

-- 8. سياسة emergency_aid_requests محدثة  
DROP POLICY IF EXISTS "emergency_insert" ON public.emergency_aid_requests;

CREATE POLICY "emergency_insert_with_validation" ON public.emergency_aid_requests
FOR INSERT WITH CHECK (
  beneficiary_id IN (SELECT id FROM public.beneficiaries WHERE user_id = auth.uid() AND deleted_at IS NULL)
);

-- 9. View لسجلات التدقيق للمستفيدين
CREATE OR REPLACE VIEW public.beneficiary_audit_trail AS
SELECT al.id, al.action_type, al.description, al.created_at, al.table_name
FROM public.audit_logs al
WHERE al.user_id = auth.uid()
   OR (al.table_name IN ('beneficiaries', 'beneficiary_requests', 'distributions', 'payment_vouchers')
       AND al.record_id IN (SELECT id::text FROM public.beneficiaries WHERE user_id = auth.uid()));