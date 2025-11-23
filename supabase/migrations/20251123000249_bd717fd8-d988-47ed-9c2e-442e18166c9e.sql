-- المرحلة 1: توحيد أنظمة المدفوعات
-- إنشاء View موحد لجميع المعاملات المالية

CREATE OR REPLACE VIEW unified_transactions_view AS
  -- المدفوعات العامة (سندات قبض/صرف)
  SELECT 
    'payment' as source,
    CASE 
      WHEN payment_type = 'قبض' THEN 'سند قبض'
      WHEN payment_type = 'صرف' THEN 'سند صرف'
      ELSE 'سند عام'
    END as source_name_ar,
    'Payment' as source_name_en,
    id,
    payment_date as transaction_date,
    amount,
    payer_name as party_name,
    payment_type as transaction_type,
    payment_method,
    description,
    status,
    journal_entry_id,
    reference_number,
    created_at,
    NULL::uuid as beneficiary_id,
    NULL::text as contract_number
  FROM payments
  
  UNION ALL
  
  -- دفعات الإيجار
  SELECT 
    'rental' as source,
    'إيجار' as source_name_ar,
    'Rental' as source_name_en,
    rp.id,
    COALESCE(rp.payment_date, rp.due_date) as transaction_date,
    rp.amount_paid as amount,
    c.tenant_name as party_name,
    'قبض' as transaction_type,
    rp.payment_method,
    'دفعة إيجار - ' || p.name || ' - ' || c.contract_number as description,
    rp.status,
    rp.journal_entry_id,
    rp.payment_number as reference_number,
    rp.created_at,
    NULL::uuid as beneficiary_id,
    c.contract_number
  FROM rental_payments rp
  LEFT JOIN contracts c ON c.id = rp.contract_id
  LEFT JOIN properties p ON p.id = c.property_id
  WHERE rp.status = 'مدفوع'
  
  UNION ALL
  
  -- التوزيعات (عند وجودها)
  SELECT 
    'distribution' as source,
    'توزيع غلة' as source_name_ar,
    'Distribution' as source_name_en,
    id,
    distribution_date as transaction_date,
    total_amount as amount,
    'توزيع ' || month as party_name,
    'صرف' as transaction_type,
    'تحويل بنكي' as payment_method,
    'توزيع غلة شهر ' || month as description,
    status,
    journal_entry_id,
    id::text as reference_number,
    created_at,
    NULL::uuid as beneficiary_id,
    NULL::text as contract_number
  FROM distributions
  WHERE status = 'معتمد'
  
  ORDER BY transaction_date DESC, created_at DESC;

-- إضافة تعليق على الـ View
COMMENT ON VIEW unified_transactions_view IS 'عرض موحد لجميع المعاملات المالية (سندات قبض/صرف + إيجارات + توزيعات)';