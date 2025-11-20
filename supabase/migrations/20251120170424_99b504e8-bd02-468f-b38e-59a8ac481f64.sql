-- حذف جميع البيانات المدخلة في آخر عملية

-- 1. حذف القيود المحاسبية المرتبطة بالدفعات الإيجارية
DELETE FROM journal_entry_lines
WHERE journal_entry_id IN (
  SELECT id FROM journal_entries
  WHERE reference_type = 'rental_payment_received'
  AND entry_date >= '2024-10-01'
);

DELETE FROM journal_entries
WHERE reference_type = 'rental_payment_received'
AND entry_date >= '2024-10-01';

-- 2. حذف جميع الدفعات الإيجارية
DELETE FROM rental_payments
WHERE payment_date >= '2024-10-01'
OR due_date >= '2024-10-01';

-- 3. حذف العقود الثلاثة الكبيرة والعقود السكنية
DELETE FROM contract_attachments
WHERE contract_id IN (
  SELECT id FROM contracts
  WHERE created_at >= '2024-11-18'
);

DELETE FROM contracts
WHERE created_at >= '2024-11-18';

-- 4. حذف العقارات التجارية الجديدة
DELETE FROM properties
WHERE type = 'تجاري'
AND created_at >= '2024-11-18';

-- 5. إعادة تعيين التسلسلات (اختياري - للحصول على أرقام نظيفة)
-- يمكن تخطي هذا إذا كنت تريد الاحتفاظ بالتسلسل