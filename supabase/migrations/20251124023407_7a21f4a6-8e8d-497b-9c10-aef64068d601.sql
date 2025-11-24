-- المرحلة 1: بيانات اختبارية (مقسمة لتجنب الأخطاء)

-- 1. طلبات الصيانة
INSERT INTO maintenance_requests (
  property_id, title, description, priority, category, status, estimated_cost, requested_by
)
SELECT 
  p.id,
  CASE 
    WHEN n = 1 THEN 'صيانة نظام التكييف'
    WHEN n = 2 THEN 'إصلاح السباكة'
    ELSE 'فحص كهرباء'
  END,
  'وصف الطلب',
  CASE WHEN n = 1 THEN 'عادية' WHEN n = 2 THEN 'عاجلة' ELSE 'عالية' END,
  CASE WHEN n = 1 THEN 'تكييف' WHEN n = 2 THEN 'سباكة' ELSE 'كهرباء' END,
  CASE WHEN n = 1 THEN 'جديد' WHEN n = 2 THEN 'قيد المراجعة' ELSE 'معتمد' END,
  (2000 + (n * 1000))::numeric(10,2),
  'إدارة الوقف'
FROM properties p
CROSS JOIN generate_series(1, 3) n
WHERE p.id IN (SELECT id FROM properties LIMIT 3);

-- 2. بنود الميزانية
INSERT INTO budgets (fiscal_year_id, account_id, period_type, period_number, budgeted_amount, actual_amount)
SELECT 
  (SELECT id FROM fiscal_years WHERE is_active = true LIMIT 1),
  a.id, 'monthly', 1,
  (15000 + (ROW_NUMBER() OVER () * 5000))::numeric(10,2),
  (12000 + (ROW_NUMBER() OVER () * 4000))::numeric(10,2)
FROM (SELECT id FROM accounts WHERE NOT is_header AND is_active = true LIMIT 10) a;

-- 3. ربط سندات الدفع
UPDATE payment_vouchers pv
SET payment_id = (
  SELECT p.id FROM payments p 
  WHERE p.beneficiary_id = pv.beneficiary_id 
  AND ABS(p.amount - pv.amount) < 1 LIMIT 1
)
WHERE pv.payment_id IS NULL;