-- إنشاء View للمدفوعات مع الأعمدة الصحيحة
CREATE OR REPLACE VIEW public.payment_vouchers_masked AS
SELECT 
  pv.id,
  pv.voucher_number,
  pv.amount,
  pv.description,
  pv.paid_at,
  pv.status,
  pv.payment_method,
  b.full_name as beneficiary_name,
  b.iban as raw_iban,
  CASE 
    WHEN b.iban IS NOT NULL 
    THEN CONCAT(LEFT(b.iban, 4), '********', RIGHT(b.iban, 4))
    ELSE NULL 
  END as iban_masked,
  pv.created_at
FROM payment_vouchers pv
LEFT JOIN beneficiaries b ON pv.beneficiary_id = b.id;

COMMENT ON VIEW public.payment_vouchers_masked IS 'عرض آمن لسندات الصرف مع إخفاء IBAN';