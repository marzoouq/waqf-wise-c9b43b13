-- ============================================
-- إصلاح Security Definer Views
-- تحويل جميع Views إلى SECURITY INVOKER
-- ============================================

-- 1. تحديث جميع Views الموجودة
ALTER VIEW IF EXISTS beneficiary_statistics SET (security_invoker = true);
ALTER VIEW IF EXISTS distribution_statistics SET (security_invoker = true);
ALTER VIEW IF EXISTS messages_with_users SET (security_invoker = true);
ALTER VIEW IF EXISTS payment_vouchers_with_details SET (security_invoker = true);
ALTER VIEW IF EXISTS users_with_roles SET (security_invoker = true);
ALTER VIEW IF EXISTS property_occupancy_stats SET (security_invoker = true);
ALTER VIEW IF EXISTS contract_expiry_alerts SET (security_invoker = true);
ALTER VIEW IF EXISTS rental_payment_summary SET (security_invoker = true);

-- 2. إضافة تعليق للتوثيق
COMMENT ON VIEW beneficiary_statistics IS 'إحصائيات المستفيدين - SECURITY INVOKER';
COMMENT ON VIEW distribution_statistics IS 'إحصائيات التوزيعات - SECURITY INVOKER';
COMMENT ON VIEW messages_with_users IS 'الرسائل مع المستخدمين - SECURITY INVOKER';
COMMENT ON VIEW payment_vouchers_with_details IS 'سندات الدفع مع التفاصيل - SECURITY INVOKER';
COMMENT ON VIEW users_with_roles IS 'المستخدمون مع الأدوار - SECURITY INVOKER';