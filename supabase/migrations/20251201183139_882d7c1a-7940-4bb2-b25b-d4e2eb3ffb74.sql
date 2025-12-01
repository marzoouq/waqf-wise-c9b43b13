
-- إنشاء دفعات من التوزيعات الموجودة وتحديث أرصدة المستفيدين

-- أولاً: إنشاء دفعات لكل توزيع مستحق
INSERT INTO payments (
    beneficiary_id,
    amount,
    payment_date,
    payment_type,
    payment_method,
    status,
    description,
    payment_number,
    reference_number,
    payer_name
)
SELECT 
    hd.beneficiary_id,
    hd.share_amount,
    hd.distribution_date,
    'payment',
    'bank_transfer',
    'completed',
    'حصة ' || hd.heir_type || ' للسنة المالية 2024-2025',
    'PAY-' || EXTRACT(YEAR FROM hd.distribution_date) || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY b.full_name)::text, 4, '0'),
    'REF-' || hd.id,
    'الوقف'
FROM heir_distributions hd
JOIN beneficiaries b ON b.id = hd.beneficiary_id
WHERE NOT EXISTS (
    SELECT 1 FROM payments p 
    WHERE p.beneficiary_id = hd.beneficiary_id 
    AND p.reference_number = 'REF-' || hd.id
);

-- ثانياً: تحديث أرصدة المستفيدين
UPDATE beneficiaries b
SET 
    total_received = (
        SELECT COALESCE(SUM(share_amount), 0)
        FROM heir_distributions hd
        WHERE hd.beneficiary_id = b.id
    ),
    account_balance = (
        SELECT COALESCE(SUM(share_amount), 0)
        FROM heir_distributions hd
        WHERE hd.beneficiary_id = b.id
    ),
    total_payments = (
        SELECT COALESCE(COUNT(*), 0)
        FROM payments p
        WHERE p.beneficiary_id = b.id
    ),
    updated_at = now()
WHERE EXISTS (
    SELECT 1 FROM heir_distributions hd
    WHERE hd.beneficiary_id = b.id
);
