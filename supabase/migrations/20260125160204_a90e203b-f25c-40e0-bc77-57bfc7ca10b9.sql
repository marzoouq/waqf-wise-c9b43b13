-- إصلاح SECURITY DEFINER Views بتحويلها إلى SECURITY INVOKER

-- 1. إعادة إنشاء beneficiaries_secure بدون SECURITY DEFINER
DROP VIEW IF EXISTS public.beneficiaries_secure;

CREATE VIEW public.beneficiaries_secure 
WITH (security_invoker = on)
AS
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

-- 2. إعادة إنشاء beneficiary_audit_trail بدون SECURITY DEFINER
DROP VIEW IF EXISTS public.beneficiary_audit_trail;

CREATE VIEW public.beneficiary_audit_trail 
WITH (security_invoker = on)
AS
SELECT al.id, al.action_type, al.description, al.created_at, al.table_name
FROM public.audit_logs al
WHERE al.user_id = auth.uid()
   OR (al.table_name IN ('beneficiaries', 'beneficiary_requests', 'distributions', 'payment_vouchers')
       AND al.record_id IN (SELECT id::text FROM public.beneficiaries WHERE user_id = auth.uid()));