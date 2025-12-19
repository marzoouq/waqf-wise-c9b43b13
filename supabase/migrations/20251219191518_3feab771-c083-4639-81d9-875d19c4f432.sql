-- إصلاح تحذير Security Definer View
-- تحويل Views إلى SECURITY INVOKER (الافتراضي الآمن)

DROP VIEW IF EXISTS public.payment_vouchers_masked;
DROP VIEW IF EXISTS public.beneficiaries_masked;

-- إعادة إنشاء View المستفيدين بـ SECURITY INVOKER
CREATE VIEW public.beneficiaries_masked 
WITH (security_invoker = true)
AS
SELECT 
  id,
  full_name,
  CASE 
    WHEN national_id IS NOT NULL 
    THEN CONCAT('****', RIGHT(national_id, 4))
    ELSE NULL 
  END as national_id_masked,
  CASE 
    WHEN phone IS NOT NULL 
    THEN CONCAT('*****', RIGHT(phone, 4))
    ELSE NULL 
  END as phone_masked,
  CASE 
    WHEN iban IS NOT NULL 
    THEN CONCAT(LEFT(iban, 4), '****', RIGHT(iban, 4))
    ELSE NULL 
  END as iban_masked,
  category,
  status,
  beneficiary_type,
  gender,
  city,
  total_received,
  total_payments,
  created_at
FROM beneficiaries;

-- إعادة إنشاء View المدفوعات بـ SECURITY INVOKER (بدون raw_iban)
CREATE VIEW public.payment_vouchers_masked 
WITH (security_invoker = true)
AS
SELECT 
  pv.id,
  pv.voucher_number,
  pv.amount,
  pv.description,
  pv.paid_at,
  pv.status,
  pv.payment_method,
  b.full_name as beneficiary_name,
  CASE 
    WHEN b.iban IS NOT NULL 
    THEN CONCAT(LEFT(b.iban, 4), '********', RIGHT(b.iban, 4))
    ELSE NULL 
  END as iban_masked,
  pv.created_at
FROM payment_vouchers pv
LEFT JOIN beneficiaries b ON pv.beneficiary_id = b.id;

COMMENT ON VIEW public.beneficiaries_masked IS 'عرض آمن للمستفيدين مع إخفاء البيانات الحساسة - SECURITY INVOKER';
COMMENT ON VIEW public.payment_vouchers_masked IS 'عرض آمن لسندات الصرف مع إخفاء IBAN - SECURITY INVOKER';