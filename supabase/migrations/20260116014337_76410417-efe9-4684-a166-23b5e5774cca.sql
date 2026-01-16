
-- إصلاح تحذير الأمان: إعادة إنشاء الـ View بدون SECURITY DEFINER
DROP VIEW IF EXISTS waqf_balance_summary;
CREATE VIEW waqf_balance_summary 
WITH (security_invoker = true) AS
SELECT 
  wu.id,
  wu.name,
  wu.code,
  COALESCE(wu.current_balance, 0) as current_balance,
  COALESCE(wu.total_income, 0) as total_income,
  COALESCE(wu.total_expenses, 0) as total_expenses,
  (SELECT COUNT(*) FROM distributions d WHERE d.waqf_unit_id = wu.id AND d.status = 'completed') as completed_distributions,
  (SELECT COALESCE(SUM(pv.amount), 0) FROM payment_vouchers pv WHERE pv.waqf_unit_id = wu.id AND pv.status = 'paid') as total_vouchers_paid,
  (SELECT COALESCE(SUM(rp.amount_paid), 0) FROM rental_payments rp WHERE rp.waqf_unit_id = wu.id AND rp.status = 'paid') as total_rentals_received
FROM waqf_units wu
WHERE wu.is_active = true;
